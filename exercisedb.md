ExerciseDB API - v1 (Open Source)
ExerciseDB API v1 is a fully open-source and developer-friendly fitness exercise database featuring over 1,500 structured exercises with GIF-based visual media. It includes detailed metadata like target muscles, equipment, and body parts, designed for fast integration into fitness apps, personal trainer platforms, and health tools.

📝 NOTE: This version is public, free to use, and includes both the code and dataset metadata — making it perfect for personal projects, prototypes, learning, and community-driven apps.

🏋🏼‍♀️ ExerciseDB API
ExerciseDB API is a comprehensive and developer-friendly database featuring over 5,000 structured, high-quality fitness exercises. It delivers fast, modern, and scalable access to detailed exercise data—including targeted muscle groups, required equipment, visual aids (images and videos), and step-by-step instructions. Ideal for developers, fitness startups, and health platforms, ExerciseDB empowers the creation of smart workout apps, personalized training plans, and interactive fitness tools.

Perfect for:

💪 Fitness app developers
🏃‍♀️ Health & wellness platforms
🎯 Personal training applications
📱 Workout planning tools
🔬 Fitness research projects

🚀 Deploy Your Own API (V1)
Want to self-host the open-source ExerciseDB API (V1)?

You can instantly deploy it to Vercel with just one click and have your own version running in seconds — no backend setup needed.

### EXERCISES 
get
/api/v1/exercises/search
get
/api/v1/exercises
get
/api/v1/exercises/filter
get
/api/v1/exercises/{exerciseId}
get
/api/v1/bodyparts/{bodyPartName}/exercises
get
/api/v1/equipments/{equipmentName}/exercises
get
/api/v1/muscles/{muscleName}/exercises

### Search exercises with fuzzy matching​
https://www.exercisedb.dev/docs#tag/exercises/get/api/v1/exercises/search

Search exercises using fuzzy matching across all fields (name, muscles, equipment, body parts). Perfect for when users don't know exact terms.

Query Parameters
offsetCopy link to offset
Type:Offset
default: 
0
The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.

limitCopy link to limit
Type:Limit
min:  
1
max:  
25
default: 
10
Example
The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.

qCopy link to q
Type:Search Query
default: 
""
required
Example
Search term that will be fuzzy matched against exercise names, muscles, equipment, and body parts

thresholdCopy link to threshold
Type:Search Threshold
default: 
0.3
Example
Fuzzy search threshold (0 = exact match, 1 = very loose match)

{
  "success": true,
  "metadata": {
    "totalExercises": 150,
    "totalPages": 15,
    "currentPage": 1,
    "previousPage": "/api/exercises?offset=0&limit=10",
    "nextPage": "/api/exercises?offset=20&limit=10"
  },
  "data": [
    {
      "exerciseId": "string",
      "name": "string",
      "gifUrl": "string",
      "targetMuscles": [
        "string"
      ],
      "bodyParts": [
        "string"
      ],
      "equipments": [
        "string"
      ],
      "secondaryMuscles": [
        "string"
      ],
      "instructions": [
        "string"
      ]
    }
  ]
}

### Get all exercises with optional search
Retrieve all exercises with optional fuzzy search filtering

Query Parameters
offsetCopy link to offset
Type:Offset
default: 
0
The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.

limitCopy link to limit
Type:Limit
min:  
1
max:  
25
default: 
10
Example
The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.

searchCopy link to search
Type:Search Query
default: 
""
Example
Optional search term for fuzzy matching across all exercise fields

sortByCopy link to sortBy
Type:Sort Field
enum
default: 
"targetMuscles"
Example
Field to sort exercises by

name
exerciseId
targetMuscles
bodyParts
equipments
sortOrderCopy link to sortOrder
Type:Sort Order
enum
default: 
"desc"
Example
Sort order (ascending or descending)

asc
desc

{
  "success": true,
  "metadata": {
    "totalExercises": 150,
    "totalPages": 15,
    "currentPage": 1,
    "previousPage": "/api/exercises?offset=0&limit=10",
    "nextPage": "/api/exercises?offset=20&limit=10"
  },
  "data": [
    {
      "exerciseId": "string",
      "name": "string",
      "gifUrl": "string",
      "targetMuscles": [
        "string"
      ],
      "bodyParts": [
        "string"
      ],
      "equipments": [
        "string"
      ],
      "secondaryMuscles": [
        "string"
      ],
      "instructions": [
        "string"
      ]
    }
  ]
}

### Advanced exercise filtering
https://www.exercisedb.dev/docs#tag/exercises/get/api/v1/exercises/filter

Advance Filter exercises by multiple criteria with fuzzy search support

Query Parameters
offsetCopy link to offset
Type:Offset
default: 
0
The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.

limitCopy link to limit
Type:Limit
min:  
1
max:  
25
default: 
10
Example
The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.

searchCopy link to search
Type:Search Query
Example
Fuzzy search across all fields

musclesCopy link to muscles
Type:Target Muscles
Example
Comma-separated list of target muscles

equipmentCopy link to equipment
Type:Equipment
Example
Comma-separated list of equipment

bodyPartsCopy link to bodyParts
Type:Body Parts
Example
Comma-separated list of body parts

sortByCopy link to sortBy
Type:Sort Field
enum
default: 
"name"
Example
Field to sort by

name
exerciseId
targetMuscles
bodyParts
equipments
sortOrderCopy link to sortOrder
Type:Sort Order
enum
default: 
"desc"
Example
Sort order

asc
desc

{
  "success": true,
  "metadata": {
    "totalExercises": 150,
    "totalPages": 15,
    "currentPage": 1,
    "previousPage": "/api/exercises?offset=0&limit=10",
    "nextPage": "/api/exercises?offset=20&limit=10"
  },
  "data": [
    {
      "exerciseId": "string",
      "name": "string",
      "gifUrl": "string",
      "targetMuscles": [
        "string"
      ],
      "bodyParts": [
        "string"
      ],
      "equipments": [
        "string"
      ],
      "secondaryMuscles": [
        "string"
      ],
      "instructions": [
        "string"
      ]
    }
  ]
}

### GetExerciseById​
https://www.exercisedb.dev/docs#tag/exercises/get/api/v1/exercises/{exerciseId}

Path Parameters
exerciseIdCopy link to exerciseId
Type:Exercise ID
default: 
"ztAa1RK"
required
Example
The unique identifier of the exercise to retrieve.

{
  "success": true,
  "data": {
    "exerciseId": "string",
    "name": "string",
    "gifUrl": "string",
    "targetMuscles": [
      "string"
    ],
    "bodyParts": [
      "string"
    ],
    "equipments": [
      "string"
    ],
    "secondaryMuscles": [
      "string"
    ],
    "instructions": [
      "string"
    ]
  }
}

### GetExercisesByBodyparts
https://www.exercisedb.dev/docs#tag/exercises/get/api/v1/bodyparts/{bodyPartName}/exercises

Retrieve exercises that target a specific body part

Path Parameters
bodyPartNameCopy link to bodyPartName
Type:string
default: 
"upper arms"
required
Example
Body part name (case-insensitive)

Query Parameters
offsetCopy link to offset
Type:Offset
default: 
0
The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.

limitCopy link to limit
Type:Limit
min:  
1
max:  
25
default: 
10
Example
The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.

{
  "success": true,
  "metadata": {
    "totalExercises": 150,
    "totalPages": 15,
    "currentPage": 1,
    "previousPage": "/api/exercises?offset=0&limit=10",
    "nextPage": "/api/exercises?offset=20&limit=10"
  },
  "data": [
    {
      "exerciseId": "string",
      "name": "string",
      "gifUrl": "string",
      "targetMuscles": [
        "string"
      ],
      "bodyParts": [
        "string"
      ],
      "equipments": [
        "string"
      ],
      "secondaryMuscles": [
        "string"
      ],
      "instructions": [
        "string"
      ]
    }
  ]
}

### GetExercisesByEquipment​
https://www.exercisedb.dev/docs#tag/exercises/get/api/v1/equipments/{equipmentName}/exercises

Retrieve exercises that use specific equipment

Path Parameters
equipmentNameCopy link to equipmentName
Type:string
default: 
"dumbbell"
required
Example
Equipment name (case-insensitive)

Query Parameters
offsetCopy link to offset
Type:Offset
default: 
0
The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.

limitCopy link to limit
Type:Limit
min:  
1
max:  
25
default: 
10
Example
The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.

{
  "success": true,
  "metadata": {
    "totalExercises": 150,
    "totalPages": 15,
    "currentPage": 1,
    "previousPage": "/api/exercises?offset=0&limit=10",
    "nextPage": "/api/exercises?offset=20&limit=10"
  },
  "data": [
    {
      "exerciseId": "string",
      "name": "string",
      "gifUrl": "string",
      "targetMuscles": [
        "string"
      ],
      "bodyParts": [
        "string"
      ],
      "equipments": [
        "string"
      ],
      "secondaryMuscles": [
        "string"
      ],
      "instructions": [
        "string"
      ]
    }
  ]
}

### GetExercisesByMuscle
https://www.exercisedb.dev/docs#tag/exercises/get/api/v1/muscles/{muscleName}/exercises

Retrieve exercises that target a specific muscle

Path Parameters
muscleNameCopy link to muscleName
Type:string
default: 
"abs"
required
Example
Target muscle name (case-insensitive)

Query Parameters
offsetCopy link to offset
Type:Offset
default: 
0
The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.

limitCopy link to limit
Type:Limit
min:  
1
max:  
25
default: 
10
Example
The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.

includeSecondaryCopy link to includeSecondary
Type:Include Secondary Muscles
default: 
false
Whether to include exercises where this muscle is a secondary target

{
  "success": true,
  "metadata": {
    "totalExercises": 150,
    "totalPages": 15,
    "currentPage": 1,
    "previousPage": "/api/exercises?offset=0&limit=10",
    "nextPage": "/api/exercises?offset=20&limit=10"
  },
  "data": [
    {
      "exerciseId": "string",
      "name": "string",
      "gifUrl": "string",
      "targetMuscles": [
        "string"
      ],
      "bodyParts": [
        "string"
      ],
      "equipments": [
        "string"
      ],
      "secondaryMuscles": [
        "string"
      ],
      "instructions": [
        "string"
      ]
    }
  ]
}

### GetAllMuscles​
https://www.exercisedb.dev/docs#tag/muscles/get/api/v1/muscles

{
  "success": true,
  "data": [
    {
      "name": "string"
    }
  ]
}

### GetAllEquipments​
https://www.exercisedb.dev/docs#tag/equipments/get/api/v1/equipments

{
  "success": true,
  "data": [
    {
      "name": "string"
    }
  ]
}

### GetAllBodyparts
https://www.exercisedb.dev/docs#tag/bodyparts/get/api/v1/bodyparts

{
  "success": true,
  "data": [
    {
      "name": "string"
    }
  ]
}


🏋️‍♂️ V2 Exercise Sample
{
  "exerciseId": "K6NnTv0",
  "name": "Bench Press",
  "imageUrl": "Barbell-Bench-Press_Chest.png",
  "equipments": ["Barbell"],
  "bodyParts": ["Chest"],
  "exerciseType": "weight_reps",
  "targetMuscles": ["Pectoralis Major Clavicular Head"],
  "secondaryMuscles": ["Deltoid Anterior", "Pectoralis Major Clavicular Head", "Triceps Brachii"],
  "videoUrl": "Barbell-Bench-Press_Chest_.mp4",
  "keywords": [
    "Chest workout with barbell",
    "Barbell bench press exercise",
    "Strength training for chest",
    "Upper body workout with barbell",
    "Barbell chest exercises",
    "Bench press for chest muscles",
    "Building chest muscles with bench press",
    "Chest strengthening with barbell",
    "Bench press workout routine",
    "Barbell exercises for chest muscle growth"
  ],
  "overview": "The Bench Press is a classic strength training exercise that primarily targets the chest, shoulders, and triceps, contributing to upper body muscle development. It is suitable for anyone, from beginners to professional athletes, looking to improve their upper body strength and muscular endurance. Individuals may want to incorporate bench press into their routine for its effectiveness in enhancing physical performance, promoting bone health, and improving body composition.",
  "instructions": [
    "Grip the barbell with your hands slightly wider than shoulder-width apart, palms facing your feet, and lift it off the rack, holding it straight over your chest with your arms fully extended.",
    "Slowly lower the barbell down to your chest while keeping your elbows at a 90-degree angle.",
    "Once the barbell touches your chest, push it back up to the starting position while keeping your back flat on the bench.",
    "Repeat this process for the desired number of repetitions, always maintaining control of the barbell and ensuring your form is correct."
  ],
  "exerciseTips": [
    "Avoid Arching Your Back: One common mistake is excessively arching the back during the lift. This can lead to lower back injuries. Your lower back should have a natural arch, but it should not be overly exaggerated. Your butt, shoulders, and head should maintain contact with the bench at all times.",
    "Controlled Movement: Avoid the temptation to lift the barbell too quickly. A controlled, steady lift is more effective and reduces the risk of injury. Lower the bar to your mid-chest slowly, pause briefly, then push it back up without locking your elbows at the top.",
    "Don't Lift Alone:"
  ],
  "variations": [
    "Decline Bench Press: This variation is performed on a decline bench to target the lower part of the chest.",
    "Close-Grip Bench Press: This variation focuses on the triceps and the inner part of the chest by placing the hands closer together on the bar.",
    "Dumbbell Bench Press: This variation uses dumbbells instead of a barbell, allowing for a greater range of motion and individual arm movement.",
    "Reverse-Grip Bench Press: This variation is performed by flipping your grip so that your palms face towards you, targeting the upper chest and triceps."
  ],
  "relatedExerciseIds": [
    "U0uPZBq",
    "QD32SbB",
    "pdm4AfV",
    "SebLXCG",
    "T3JogV7",
    "hiWPEs1",
    "Y5ppDdt",
    "C8OV7Pv",
    "r3tQt3U",
    "dCSgT7N"
  ]
}