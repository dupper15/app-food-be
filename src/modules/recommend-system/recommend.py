#!/usr/bin/env python3
import sys
import json
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend_restaurants(data):
    try:
        all_user_dishes = set() 
        for restaurant in data:
            user_dishes = restaurant.get("user_dishes", [])
            if user_dishes:
                all_user_dishes.update(user_dishes)
    
        if not all_user_dishes:
            return []
        
        user_profile = " ".join(str(dish) for dish in all_user_dishes)
        
        restaurant_profiles = []
        restaurant_ids = []
        restaurant_names = []
        
        for restaurant in data:
            restaurant_id = restaurant.get("restaurantId")
            restaurant_name = restaurant.get("name", "")
            dishes = restaurant.get("dishes", [])
            
            if not dishes:
                continue
                
            restaurant_profile = " ".join(str(dish) for dish in dishes)
            restaurant_profiles.append(restaurant_profile)
            restaurant_ids.append(restaurant_id)
            restaurant_names.append(restaurant_name)
        
        if not restaurant_profiles:
            return []
        
        corpus = [user_profile] + restaurant_profiles
        
        vectorizer = CountVectorizer()
        X = vectorizer.fit_transform(corpus)
        
        similarities = cosine_similarity(X[0:1], X[1:]).flatten()
        
        results = []
        for i, score in enumerate(similarities):
            results.append({
                "restaurantId": restaurant_ids[i],
                "name": restaurant_names[i],
                "score": float(score)
            })
        
        results.sort(key=lambda x: x["score"], reverse=True)
    
        filtered_results = [r for r in results if r["score"] > 0]
        
        return [r["restaurantId"] for r in filtered_results]
    
    except Exception as e:
        sys.stderr.write(f"Error in recommendation algorithm: {str(e)}\n")
        return []

if __name__ == "__main__":
    try:
        # Read input data from stdin
        input_data = sys.stdin.read().strip()
        
        # Log input size for debugging
        sys.stderr.write(f"Received input of size: {len(input_data)} bytes\n")
        
        # Parse JSON input
        data = json.loads(input_data)
        
        # Log parsed data summary
        sys.stderr.write(f"Successfully parsed data for {len(data)} restaurants\n")
        
        # Generate recommendations
        recommended_restaurant_ids = recommend_restaurants(data)
        
        # Log output summary
        sys.stderr.write(f"Generated {len(recommended_restaurant_ids)} recommendations\n")
        
        # Output as JSON
        result_json = json.dumps(recommended_restaurant_ids)
        print(result_json)
        sys.stdout.flush()
        
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Failed to parse JSON input: {str(e)}\n")
        print("[]")
        sys.stdout.flush()
        
    except Exception as e:
        sys.stderr.write(f"Unexpected error: {str(e)}\n")
        print("[]")
        sys.stdout.flush()