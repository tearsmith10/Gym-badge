/* ==========================================================================
   GYM BADGE — exercise library, equipment status and food education

   Three reference datasets that the app screens read from:

   • EXERCISES   full coaching detail for every movement — purpose, muscles,
                 equipment, how to start, step by step, sets and rest, breathing,
                 common mistakes, safety notes, easier modifications and a
                 gallery of demonstration photographs.

   • EQUIPMENT   each machine plus a written status report, so a member is
                 told *why* something is out of service, when it was reported,
                 when it is expected back and who is dealing with it.

   • FOODS       nutrition written for a ten year old, not a textbook: what
                 the food is, what it does for you, how it fits a goal, what
                 to swap it for, allergens and cultural variations.

   Images are real photographs shipped with the app. Where a movement has no
   photograph yet, the gallery says so plainly rather than showing an
   unrelated picture.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------------- exercise library ----------------
     fields:
       id, name, unit, type, category, difficulty, muscles[], equipment[],
       purpose, start, steps[], sets, reps, rest, breathing, mistakes[],
       safety[], easier[], gallery[] (image paths), gender: "any"|"female"|"male"
  --------------------------------------------------------------------- */
  var EXERCISES = [
    {
      id: "pushup", name: "Push Ups", unit: "reps", type: "count",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Chest", "Triceps", "Front of shoulders", "Core"],
      equipment: ["None needed"],
      purpose: "Push ups build pushing strength in the chest, shoulders and arms, and they train your core to stay straight while you do it.",
      start: "Lie face down on the floor. Place your hands on the floor slightly wider than your shoulders, so your thumbs are roughly level with your fingers. Straighten your legs behind you and rest on the balls of your feet.",
      steps: [
        "Squeeze your bum and your stomach so your body forms one straight line from head to heels.",
        "Bend your elbows to about 45 degrees from your body, and lower your chest towards the floor.",
        "Stop when your chest is a fist's height from the floor, keeping your elbows tucked in.",
        "Push the floor away with your hands so you return to the start position.",
        "Repeat, keeping the movement smooth and controlled rather than fast."
      ],
      sets: "3 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "60 to 90 seconds",
      breathing: "Breathe in as you lower and breathe out as you push up. Do not hold your breath at the bottom.",
      mistakes: [
        "Letting your hips sag, which puts strain on your lower back.",
        "Flaring your elbows straight out to the sides, which strains the shoulder.",
        "Half repping — going down to the floor but not controlling the way up.",
        "Doing so many reps that the form breaks down completely."
      ],
      safety: [
        "Stop if you feel sharp pain in your shoulders, wrists or chest.",
        "Keep your neck in line with your spine by looking at the floor a little ahead of your hands.",
        "If you are a complete beginner, start with push ups against a wall or on your knees."
      ],
      easier: [
        "Wall push ups — hands on a wall, body at an angle.",
        "Knee push ups — knees on the floor, body straight from knee to head.",
        "Elevated push ups — hands on a bench or sturdy chair."
      ],
      gallery: ["ex/pushup-1.jpg", "ex/pushup-2.jpg", "ex/pushup-3.jpg", "ex/pushup-4.jpg"]
    },
    {
      id: "squat", name: "Squats", unit: "reps", type: "count",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
      equipment: ["None needed, or a barbell for loaded squats"],
      purpose: "Squats are one of the best all round lower body exercises. They build leg strength, help you sit, stand and climb stairs, and they protect your knees and lower back when done well.",
      start: "Stand with your feet a little wider than your hips, toes turned slightly out. Keep your chest tall and your weight in the middle of your foot.",
      steps: [
        "Take a breath and brace your stomach as if someone is about to poke you.",
        "Send your hips down and back, as if you are sitting into a chair.",
        "Keep your knees tracking over your toes, in the same direction as they point.",
        "Lower until your thighs are roughly parallel to the floor, or as far as you can while keeping your heels down.",
        "Drive through the whole foot to stand back up, squeezing your glutes at the top."
      ],
      sets: "3 sets of 10 to 15 reps", reps: "10 to 15 reps", rest: "90 seconds",
      breathing: "Breathe in at the top, brace, then breathe out as you stand up.",
      mistakes: [
        "Heels lifting off the floor.",
        "Knees collapsing inwards towards each other.",
        "Rounding your lower back at the bottom of the rep.",
        "Going too low with poor control rather than stopping at a good depth."
      ],
      safety: [
        "Pain in the knees is a signal to shallow the range and get a coach to check your stance.",
        "Never let a spotter push you down onto your heels.",
        "If you are pregnant or have knee or back injuries, ask a professional before adding deep squats."
      ],
      easier: [
        "Box squats — sit down to a box or chair and stand back up.",
        "Goblet squats — hold a weight at your chest to stay upright.",
        "Wall sits — hold a squat position against a wall."
      ],
      gallery: ["ex/squat-1.jpg", "ex/squat-2.jpg", "ex/squat-3.jpg", "ex/squat-4.jpg"]
    },
    {
      id: "lunge", name: "Lunges", unit: "reps", type: "count",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
      equipment: ["None needed"],
      purpose: "Lunges build single leg strength, which fixes the imbalances that cause knee and hip pain, and they make stairs and hills easier.",
      start: "Stand tall with your feet hip width apart and your hands on your hips or by your sides.",
      steps: [
        "Step forward with one foot far enough that your front knee stays behind your toes.",
        "Lower straight down, bending both knees towards 90 degrees.",
        "Keep your back straight and your core braced the whole time.",
        "Push through your front foot to return to the start, then repeat on the other leg."
      ],
      sets: "3 sets of 8 to 12 reps each leg", reps: "8 to 12 reps per leg", rest: "60 to 90 seconds",
      breathing: "Breathe in as you step forward, breathe out as you push back up.",
      mistakes: [
        "Stepping too short, so the front knee shoots past the toes.",
        "Leaning forward over the front knee.",
        "Twisting your back on the way up."
      ],
      safety: [
        "Hold a wall or chair for balance while you learn the movement.",
        "Stop if you feel pain in your front knee.",
        "Keep lunges shallow if you have ankle mobility problems."
      ],
      easier: [
        "Reverse lunges — step backwards instead of forwards.",
        "Supported lunges — hold a counter with both hands.",
        "Static split squats — hold the bottom position without the step."
      ],
      gallery: ["ex/lunge-1.jpg", "ex/lunge-2.jpg"]
    },
    {
      id: "plank", name: "Plank", unit: "sec", type: "time",
      category: "Core", difficulty: "Beginner",
      muscles: ["Deep core", "Front of shoulders", "Glutes"],
      equipment: ["Mat or floor"],
      purpose: "The plank trains your core to hold your body steady, which is what protects your lower back during every other exercise.",
      start: "Place your forearms on the floor with your elbows directly under your shoulders. Extend your legs behind you and rest on the balls of your feet.",
      steps: [
        "Squeeze your glutes and tuck your pelvis slightly so your lower back stays flat.",
        "Pull your elbows towards your toes and lengthen through the crown of your head.",
        "Breathe steadily, keeping your body in one straight line from shoulders to heels.",
        "Hold for the target time, then lower yourself under control."
      ],
      sets: "3 sets of 20 to 45 seconds", reps: "Hold 20 to 45 seconds", rest: "45 to 60 seconds",
      breathing: "Breathe slowly and evenly through your nose. Do not hold your breath.",
      mistakes: [
        "Letting your hips drop, which loads the lower back.",
        "Pushing your bum up too high, so the core stops working.",
        "Holding your breath.",
        "Rounding the upper back."
      ],
      safety: [
        "Come down straight away if your lower back starts to ache.",
        "If you cannot hold the position at all, try a plank on your knees.",
        "Stop if you feel any neck or shoulder pain."
      ],
      easier: [
        "Forearm plank on your knees.",
        "Straight arm plank against a wall.",
        "Short 10 second holds with a full rest between them."
      ],
      gallery: ["ex/plank-1.jpg", "ex/plank-2.jpg", "ex/plank-3.jpg"]
    },
    {
      id: "pullup", name: "Pull Ups", unit: "reps", type: "count",
      category: "Upper body", difficulty: "Intermediate",
      muscles: ["Back", "Biceps", "Rear shoulders", "Forearms"],
      equipment: ["Pull up bar or sturdy bar"],
      purpose: "Pull ups are the classic upper body builder. They develop a strong back, wide shoulders and arms that carry their own weight.",
      start: "Hang from a bar with an overhand grip slightly wider than your shoulders, and pull your shoulder blades down.",
      steps: [
        "Start with your arms straight and your body hanging.",
        "Pull your shoulder blades down and towards your hips.",
        "Bend your elbows and bring your chin towards the bar.",
        "Lower yourself slowly, all the way back to straight arms, and take a new breath."
      ],
      sets: "4 sets of 4 to 8 reps", reps: "4 to 8 reps", rest: "2 to 3 minutes",
      breathing: "Exhale as you pull up, inhale as you lower.",
      mistakes: [
        "Kipping or swinging to get extra height.",
        "Pulling with the arms only and letting the shoulders hike up to the ears.",
        "Dropping from the top instead of lowering under control."
      ],
      safety: [
        "Do not drop from the bar — always lower yourself.",
        "Use a mat or spotter when learning.",
        "Stop if you feel a sharp shoulder pain."
      ],
      easier: [
        "Bands around the bar to take some of your weight.",
        "Negative pull ups — jump up, lower yourself slowly.",
        "Lat pulldown on a machine."
      ],
      gallery: ["ex/pullup-1.jpg"]
    },
    {
      id: "situp", name: "Sit Ups", unit: "reps", type: "count",
      category: "Core", difficulty: "Beginner",
      muscles: ["Front of abdomen", "Hip flexors"],
      equipment: ["Mat"],
      purpose: "Sit ups work the muscles at the front of your core, which help you bend, brace and stand up.",
      start: "Lie on your back with your knees bent and your feet flat on the floor, a little away from your hips.",
      steps: [
        "Place your hands lightly beside your ears, without pulling on your neck.",
        "Curl your shoulders and upper back off the floor, a few inches at a time.",
        "Pause at the top without jerking.",
        "Lower yourself back down slowly, vertebra by vertebra."
      ],
      sets: "3 sets of 10 to 20 reps", reps: "10 to 20 reps", rest: "60 seconds",
      breathing: "Exhale as you come up, inhale as you lower.",
      mistakes: [
        "Pulling on the neck with your hands.",
        "Swinging up with momentum.",
        "Going all the way to a seated position using momentum."
      ],
      safety: [
        "Keep your neck neutral — the movement should come from your abs, not your neck.",
        "Avoid sit ups if you have neck or back injuries; ask a professional for an alternative.",
        "Stop if you feel neck pain."
      ],
      easier: [
        "Crunches — lift only your shoulder blades.",
        "Bend your knees and lift your feet to reduce neck strain.",
        "Dead bugs, which train the core without neck pressure."
      ],
      gallery: ["ex/situp-1.jpg"]
    },
    {
      id: "burpee", name: "Burpees", unit: "reps", type: "count",
      category: "Cardio", difficulty: "Intermediate",
      muscles: ["Full body", "Chest", "Legs", "Core"],
      equipment: ["None needed"],
      purpose: "Burpees train your whole body and your cardio at the same time, which is why they are a staple of fitness and sport.",
      start: "Stand with your feet hip width apart, hands on the floor in front of your feet.",
      steps: [
        "Squat down and place your hands on the floor.",
        "Jump or step your feet back into a straight arm plank.",
        "Keep your chest and hips level, and brace your core.",
        "Jump or step your feet back in beside your hands.",
        "Stand up and reach overhead, then drop straight back down to repeat."
      ],
      sets: "3 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "60 to 90 seconds",
      breathing: "Breathe out as you stand and jump, breathe in as you go down to the floor.",
      mistakes: [
        "Letting your hips sag in the plank.",
        "Skipping the overhead reach, which is where the cardio benefit comes from.",
        "Rushing so the movement loses control."
      ],
      safety: [
        "Step the feet back instead of jumping if your wrists or lower back complain.",
        "Land softly on the balls of your feet.",
        "Do not do full burpees with a chest injury without professional guidance."
      ],
      easier: [
        "Step back instead of jump back.",
        "Burpees without the overhead reach.",
        "Elevated step ups onto a bench instead of a jump."
      ],
      gallery: ["ex/burpee-1.jpg", "ex/burpee-2.jpg", "ex/burpee-3.jpg", "ex/burpee-4.jpg", "ex/burpee-5.jpg"]
    },
    {
      id: "dumbbellrow", name: "Dumbbell Row", unit: "reps", type: "count",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Back", "Biceps", "Rear shoulders"],
      equipment: ["One dumbbell, or a bench and two dumbbells"],
      purpose: "Rows pull the shoulder blades together, which builds a strong, capable back and helps you sit up straighter.",
      start: "Put a bench in front of you, stand with your knees bent, and hold a dumbbell in each hand.",
      steps: [
        "Hinge at the hips until your torso is about 45 degrees to the floor, keeping a neutral neck.",
        "Let your arms hang straight down.",
        "Pull both elbows past your ribs, drawing the dumbbells towards your hips.",
        "Squeeze your shoulder blades together for a moment, then lower under control."
      ],
      sets: "3 sets of 10 to 12 reps", reps: "10 to 12 reps", rest: "75 seconds",
      breathing: "Breathe out as you pull, breathe in as you lower.",
      mistakes: [
        "Rowing with the arms only and letting the back round over.",
        "Shrugging the shoulders up towards your ears.",
        "Using too much weight so the form breaks."
      ],
      safety: [
        "Keep your spine neutral — stop the rep if you cannot hold the position.",
        "Start with a light weight.",
        "If a bench is not available, do the same movement standing with a flat back."
      ],
      easier: [
        "Banded row seated on the floor.",
        "One arm row with a light dumbbell, hand braced on a chair.",
        "Seated cable row on a machine."
      ],
      gallery: ["ex/dumbbellrow-1.jpg", "ex/dumbbellrow-2.jpg", "ex/dumbbellrow-3.jpg", "ex/dumbbellrow-4.jpg"]
    },
    {
      id: "gobletsquat", name: "Goblet Squat", unit: "reps", type: "count",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quadriceps", "Glutes", "Core"],
      equipment: ["One dumbbell or kettlebell"],
      purpose: "The goblet squat is the friendliest way to learn to squat well, because the weight in front of your chest keeps you upright.",
      start: "Hold one dumbbell vertically against your chest with both hands under the top end.",
      steps: [
        "Stand with your feet a little wider than your hips, toes turned slightly out.",
        "Sit your hips down and back, keeping the weight tucked against your chest.",
        "Keep your chest tall and your elbows pointing down.",
        "Stand back up by driving through the floor, squeezing your glutes at the top."
      ],
      sets: "3 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "90 seconds",
      breathing: "Breathe in at the top, brace, breathe out as you stand up.",
      mistakes: [
        "Letting the weight drift away from your chest.",
        "Rounding your lower back at the bottom.",
        "Heels lifting off the floor."
      ],
      safety: [
        "Start with a light weight to learn the shape.",
        "Keep your elbows inside your knees on the way up.",
        "Stop if you feel sharp knee pain."
      ],
      easier: [
        "Goblet squat to a box.",
        "Hold the weight lower, at your waist.",
        "Bodyweight squat with hands on your chest."
      ],
      gallery: ["ex/gobletsquat-1.jpg", "ex/gobletsquat-2.jpg", "ex/gobletsquat-3.jpg", "ex/gobletsquat-4.jpg"]
    },
    {
      id: "benchdips", name: "Bench Dips", unit: "reps", type: "count",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Triceps", "Front of shoulders", "Chest"],
      equipment: ["Bench, chair or sturdy edge"],
      purpose: "Bench dips are a simple way to strengthen the triceps and the front of the shoulders using almost no equipment.",
      start: "Sit on the edge of a bench, grip the edge beside your hips, and slide your hips off in front of it.",
      steps: [
        "Keep your arms straight and your shoulders pulled down and back.",
        "Bend your elbows and lower your hips straight down.",
        "Stop when your elbows reach about 90 degrees.",
        "Press back up until your arms are straight again."
      ],
      sets: "3 sets of 8 to 15 reps", reps: "8 to 15 reps", rest: "60 seconds",
      breathing: "Breathe in as you lower, breathe out as you press up.",
      mistakes: [
        "Letting the shoulders roll forward at the bottom.",
        "Dropping too low, which puts strain on the shoulder joint.",
        "Holding the hips away from the bench so the triceps do all the work."
      ],
      safety: [
        "Use a low bench or chair at first, and never a high one.",
        "Stop if you feel sharp shoulder pain.",
        "Do not let your shoulders go below the level of your elbows."
      ],
      easier: [
        "Bend your knees to reduce the load.",
        "Do the movement on a very low step.",
        "Use a resistance band and press down into it."
      ],
      gallery: ["ex/benchdips-1.jpg", "ex/benchdips-2.jpg", "ex/benchdips-3.jpg", "ex/benchdips-4.jpg"]
    },
    {
      id: "legcurl", name: "Leg Curl", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Hamstrings", "Calves"],
      equipment: ["Leg curl machine, or a band"],
      purpose: "Leg curls build the hamstrings, the muscles at the back of your thigh, which balance out the quads and help protect your knees.",
      start: "Lie face down on the leg curl machine, hook your ankles behind the roller, and adjust the pad to sit just above your ankles.",
      steps: [
        "Hold the machine lightly with your hands and keep your hips pressed down.",
        "Curl your heels towards your glutes.",
        "Squeeze at the top for a moment.",
        "Lower the weight back slowly, all the way down."
      ],
      sets: "3 sets of 10 to 15 reps", reps: "10 to 15 reps", rest: "60 seconds",
      breathing: "Exhale as you curl, inhale as you lower.",
      mistakes: [
        "Lifting your hips off the bench.",
        "Using momentum to swing the weight.",
        "Going too heavy and losing control on the way down."
      ],
      safety: [
        "Use the lightest weight for your first set.",
        "Lower the weight under control every rep.",
        "Stop if you feel a cramp or sharp pain behind the knee."
      ],
      easier: [
        "Band leg curl standing.",
        "Slider leg curl lying on your back.",
        "Single leg curl without weight, to learn the movement."
      ],
      gallery: ["ex/legcurl-1.jpg", "ex/legcurl-2.jpg", "ex/legcurl-3.jpg"]
    },
    {
      id: "crunches", name: "Crunches", unit: "reps", type: "count",
      category: "Core", difficulty: "Beginner",
      muscles: ["Front of abdomen"],
      equipment: ["Mat"],
      purpose: "Crunches are a gentler alternative to sit ups and train the front of your core without loading your neck.",
      start: "Lie on your back, knees bent, feet flat and a little away from your hips.",
      steps: [
        "Place your hands lightly beside your ears, or cross your arms over your chest.",
        "Curl your head and shoulders a few inches off the floor.",
        "Pause for a moment at the top with your stomach squeezed.",
        "Lower yourself slowly, without letting your head flop down."
      ],
      sets: "3 sets of 12 to 20 reps", reps: "12 to 20 reps", rest: "45 seconds",
      breathing: "Exhale as you crunch up, inhale as you lower.",
      mistakes: [
        "Pulling on the neck with your hands.",
        "Using the arms to yank the upper body up.",
        "Rushing the reps so the core never really works."
      ],
      safety: [
        "Keep your chin off your chest.",
        "Stop if you feel neck pain and switch to dead bugs.",
        "Breathe out on every rep so you do not hold your breath."
      ],
      easier: [
        "Crunches with feet raised and knees bent.",
        "Short range crunches.",
        "Dead bugs, which build core strength without neck strain."
      ],
      gallery: ["ex/crunches-1.jpg", "ex/crunches-2.jpg", "ex/crunches-3.jpg"]
    },
    {
      id: "inclinepress", name: "Incline Press", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Upper chest", "Front of shoulders", "Triceps"],
      equipment: ["Dumbbells, or a barbell on an incline bench"],
      purpose: "An incline press trains the top of your chest, which most pressing programmes skip, and it is a comfortable first barbell movement for many people.",
      start: "Set a bench to a low incline, around 30 to 45 degrees. Lie back with the bar or dumbbells over your shoulders and your feet flat on the floor.",
      steps: [
        "Set your shoulder blades down and back against the bench.",
        "Hold the weight above your chest with your arms straight.",
        "Lower it towards your upper chest, keeping your elbows at about 45 degrees.",
        "Press it back up until your arms are straight again."
      ],
      sets: "3 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "2 minutes",
      breathing: "Breathe in on the way down, breathe out as you press up.",
      mistakes: [
        "Flaring your elbows out to 90 degrees.",
        "Lifting your bum off the bench to help the weight up.",
        "Bouncing the weight out of the bottom position."
      ],
      safety: [
        "Ask a spotter to hand the weight up when you are learning the barbell version.",
        "Use a lighter weight on the incline than you would on the flat.",
        "Stop if you feel shoulder pain and talk to a professional."
      ],
      easier: [
        "Dumbbell incline press instead of a barbell.",
        "A shallower incline, or push ups on an elevated surface.",
        "Machine chest press, which guides the path for you."
      ],
      gallery: ["ex/inclinepress-1.jpg", "ex/inclinepress-2.jpg", "ex/inclinepress-3.jpg", "ex/inclinepress-4.jpg"]
    },
    {
      id: "treadmill", name: "Treadmill", unit: "min", type: "time",
      category: "Cardio", difficulty: "Beginner",
      muscles: ["Full body", "Calves", "Hip flexors"],
      equipment: ["Treadmill"],
      purpose: "Walking and running on a treadmill builds cardiovascular fitness, burns energy and is a reliable way to get your heart rate up when the weather is against you.",
      start: "Step onto the treadmill while it is stopped, set the speed to a walk, then start it. Attach the safety clip to your clothing.",
      steps: [
        "Stand tall with your shoulders relaxed and look ahead, not down at the screen.",
        "Start at a comfortable pace you could hold for 20 minutes.",
        "Add a small amount of incline once the pace feels easy.",
        "Gradually increase either speed or incline, not both at once.",
        "Cool down by slowing to a walk before you step off."
      ],
      sets: "1 to 3 sessions a week", reps: "20 to 45 minutes", rest: "Walk 5 minutes to cool down",
      breathing: "Breathe steadily through your nose. Do not hold your breath when the pace is hard.",
      mistakes: [
        "Holding the handrails the whole time, which changes your posture and burns less energy.",
        "Increasing speed and incline at the same time.",
        "Stepping off while the belt is still moving."
      ],
      safety: [
        "Always clip the safety cord on.",
        "Stop immediately if you feel chest pain, severe breathlessness or dizziness.",
        "Wear proper shoes and check the belt is not loose."
      ],
      easier: [
        "Start with 10 minute walks.",
        "Walk at a slow incline instead of a fast flat pace.",
        "Use the handrails briefly to steady yourself, then let go."
      ],
      gallery: ["ex/treadmill-1.jpg", "ex/treadmill-2.jpg", "ex/treadmill-3.jpg", "ex/treadmill-4.jpg"]
    },
    {
      id: "cycling", name: "Cycling", unit: "min", type: "time",
      category: "Cardio", difficulty: "Beginner",
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
      equipment: ["Stationary bike, or a bicycle"],
      purpose: "Cycling is a low impact way to build leg endurance and heart fitness, and it is kind to your joints compared with running.",
      start: "Set the saddle so your leg is almost straight at the bottom of the pedal stroke, with a small bend in the knee.",
      steps: [
        "Start with light resistance and a comfortable cadence.",
        "Keep your back neutral and your shoulders relaxed.",
        "Add resistance gradually rather than turning up the pace.",
        "Ride for the planned time, then spin gently to cool down."
      ],
      sets: "2 to 4 sessions a week", reps: "20 to 60 minutes", rest: "5 minutes easy spin",
      breathing: "Breathe in and out steadily. On harder efforts, exhale on the down stroke.",
      mistakes: [
        "Turning the resistance so high that you bounce in the saddle.",
        "Saddle set too low, which rocks your hips.",
        "Holding the handlebars very hard, which creates tension through the shoulders."
      ],
      safety: [
        "Make sure the saddle height is right before adding resistance.",
        "Stop and get off if you feel numbness or sharp pain.",
        "Wear a helmet and use lights when riding outside in low light."
      ],
      easier: [
        "Short flat rides at low resistance.",
        "Seated pedalling only, on flat terrain.",
        "Resistance bands around the legs on a stationary bike."
      ],
      gallery: ["ex/cycling-1.jpg", "ex/cycling-2.jpg", "ex/cycling-3.jpg", "ex/cycling-4.jpg"]
    },
    {
      id: "rowing", name: "Rowing", unit: "min", type: "time",
      category: "Cardio", difficulty: "Intermediate",
      muscles: ["Back", "Legs", "Core", "Cardiovascular system"],
      equipment: ["Rowing machine"],
      purpose: "Rowing trains almost the whole body at once and is one of the best ways to build both strength and cardiovascular fitness.",
      start: "Sit on the machine, strap your feet in, and hold the handle with your arms straight.",
      steps: [
        "Start with your arms straight and your knees slightly bent.",
        "Push with your legs first, then lean back slightly.",
        "Pull the handle to your chest while keeping your elbows close to your body.",
        "Reverse the order to return: arms, then body, then legs.",
        "Keep the handle moving in a straight line to and from your chest."
      ],
      sets: "3 to 5 sessions a week", reps: "15 to 30 minutes", rest: "2 minutes between pieces",
      breathing: "Exhale as you drive the legs and pull, inhale on the recovery.",
      mistakes: [
        "Pulling with the arms before the legs have pushed.",
        "Shooting the slide past the catch and jarring the lower back.",
        "Leaning back too far at the finish.",
        "Rushing the recovery, which wastes energy."
      ],
      safety: [
        "Ask a coach to watch your first few rows so the stroke is set correctly.",
        "Stop if you feel lower back pain.",
        "Keep the handle in a straight line and do not windmill it."
      ],
      easier: [
        "Row for shorter pieces, 10 to 15 minutes.",
        "Use an easy pace and focus on the leg drive.",
        "Try a resistance band row if there is no machine."
      ],
      gallery: ["ex/rowing-1.jpg"]
    },
    {
      id: "benchpress", name: "Bench Press", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Intermediate",
      muscles: ["Chest", "Triceps", "Front of shoulders"],
      equipment: ["Barbell and bench, or dumbbells"],
      purpose: "The bench press is the benchmark for upper body pushing strength and it is the first barbell movement most people learn.",
      start: "Lie on a flat bench with your eyes under the bar. Set your shoulder blades down and back, and plant your feet firmly on the floor.",
      steps: [
        "Hold the bar above your chest with straight arms and locked wrists.",
        "Pull the bar down towards your upper chest, keeping the elbows at about 45 degrees.",
        "Touch lightly on the chest rather than bouncing the bar.",
        "Push the bar back up and slightly towards your face, so it travels over your shoulders."
      ],
      sets: "4 sets of 5 to 8 reps", reps: "5 to 8 reps", rest: "2 to 3 minutes",
      breathing: "Breathe in on the way down, breathe out as you press up.",
      mistakes: [
        "Bouncing the bar off the chest.",
        "Flaring the elbows straight out to the sides.",
        "Lifting your hips off the bench to help the bar up.",
        "Losing the arch and letting the shoulders roll forward."
      ],
      safety: [
        "Use a spotter or safety pins for your first heavy sets.",
        "Do not attempt a one rep max without supervision.",
        "Stop if you feel sharp shoulder or elbow pain."
      ],
      easier: [
        "Dumbbell bench press, which is easier to control.",
        "Machine chest press.",
        "Push ups on a raised surface, or a lighter bar with more reps."
      ],
      gallery: ["ex/benchpress-1.jpg", "ex/benchpress-2.jpg", "ex/benchpress-3.jpg", "ex/benchpress-4.jpg"]
    },
    {
      id: "deadlift", name: "Deadlift", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Advanced",
      muscles: ["Hamstrings", "Glutes", "Back", "Core", "Traps"],
      equipment: ["Barbell"],
      purpose: "The deadlift is the strongest lift there is. It builds your back, your legs and your grip, and it is the foundation of most strength programmes.",
      start: "Stand with the bar over your feet, about a hip's width away. Hinge at the hips, bend your knees, and grip the bar just outside your knees.",
      steps: [
        "Bring your chest up so your torso is at about 45 degrees, with a flat back.",
        "Pull the slack out of the bar by bending your knees slightly and pushing the bar away from your shins.",
        "Drive your feet into the floor and push your hips forward, keeping the bar close to your legs.",
        "Stand tall at the top, then reverse the movement to return the bar to the floor."
      ],
      sets: "3 to 5 sets of 3 to 6 reps", reps: "3 to 6 reps", rest: "2 to 3 minutes",
      breathing: "Take a big breath and brace before every rep. Exhale as you stand up.",
      mistakes: [
        "Starting with a rounded back instead of setting the hips first.",
        "Letting the bar drift away from your legs.",
        "Bending the knees too much so it turns into a squat.",
        "Hyperextending backwards at the top instead of standing tall."
      ],
      safety: [
        "Learn the movement with an empty bar or light dumbbells first, ideally with a coach.",
        "Never deadlift alone with heavy weight.",
        "Stop immediately if you feel pain in your back or if the bar starts to drift away from your legs."
      ],
      easier: [
        "Romanian deadlift with light dumbbells.",
        "Hip hinge with no weight, holding a broomstick for balance.",
        "Dumbbell deadlift, which is easier to control than a bar."
      ],
      gallery: ["ex/deadlift-1.jpg", "ex/deadlift-2.jpg"]
    },
    {
      id: "shoulderpress", name: "Shoulder Press", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Intermediate",
      muscles: ["Front of shoulders", "Triceps", "Upper chest"],
      equipment: ["Barbell, dumbbells or a machine"],
      purpose: "Shoulder presses build strong, capable shoulders, which makes every overhead press stronger and your posture more upright.",
      start: "Sit or stand with a bar or dumbbells at shoulder height, in front of you, with your forearms vertical.",
      steps: [
        "Set your shoulder blades down and back, and brace your core.",
        "Press the weight up and slightly back, so it travels over your head.",
        "Stop when your arms are almost straight, without locking hard at the top.",
        "Lower the weight back to shoulder height under control."
      ],
      sets: "3 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "2 minutes",
      breathing: "Exhale as you press up, inhale as you lower.",
      mistakes: [
        "Leaning back to help the weight up.",
        "Dropping the elbows down by the ears instead of keeping them forward.",
        "Lowering the weight too quickly.",
        "Pressing behind the head instead of over the shoulder."
      ],
      safety: [
        "Use a spotter when pressing heavy weight overhead.",
        "Stand with your core braced, or sit with your back supported.",
        "Stop if you feel pinching in the shoulder joint."
      ],
      easier: [
        "Seated machine shoulder press.",
        "Dumbbell press with a lighter weight.",
        "Push ups on a wall or a high bench."
      ],
      gallery: ["ex/shoulderpress-1.jpg", "ex/shoulderpress-2.jpg", "ex/shoulderpress-3.jpg", "ex/shoulderpress-4.jpg"]
    },
    {
      id: "bicepcurl", name: "Bicep Curl", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Biceps", "Forearms"],
      equipment: ["Dumbbells, or a resistance band"],
      purpose: "Curls build the biceps, the muscles at the front of your upper arm, and they train your grip and forearms too.",
      start: "Stand tall with a dumbbell in each hand, arms straight and palms facing forward.",
      steps: [
        "Keep your elbows pinned beside your ribs.",
        "Bend your elbows and curl the weights up towards your shoulders.",
        "Squeeze your biceps at the top without swinging.",
        "Lower the weights slowly, all the way back down."
      ],
      sets: "3 sets of 10 to 15 reps", reps: "10 to 15 reps", rest: "60 seconds",
      breathing: "Exhale as you curl up, inhale as you lower.",
      mistakes: [
        "Swinging the weight using your hips.",
        "Letting the elbows drift forward.",
        "Dropping the weight quickly on the way down."
      ],
      safety: [
        "Start lighter than you think you need.",
        "Keep the wrists straight rather than bending them back.",
        "Stop if you feel pain in the elbow joint."
      ],
      easier: [
        "Curl one arm at a time, seated, for more support.",
        "Resistance band curl.",
        "Hammer curls with your palms facing each other, which is easier on the wrists."
      ],
      gallery: ["ex/bicepcurl-1.jpg", "ex/bicepcurl-2.jpg", "ex/bicepcurl-3.jpg"]
    },
    {
      id: "latpulldown", name: "Lat Pulldown", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Back", "Biceps", "Rear shoulders"],
      equipment: ["Lat pulldown machine, or a bar and a doorframe anchor"],
      purpose: "The lat pulldown is the easiest way to train your back if pull ups are too hard, and it teaches the same pulling pattern.",
      start: "Sit at the machine with your thighs secured under the pads. Take a grip just wider than your shoulders.",
      steps: [
        "Lean back slightly, around 15 degrees, with a tall spine.",
        "Pull the bar to your upper chest, leading with your elbows.",
        "Let your shoulder blades move towards your spine at the top.",
        "Return the bar slowly until your arms are straight."
      ],
      sets: "3 sets of 10 to 12 reps", reps: "10 to 12 reps", rest: "75 seconds",
      breathing: "Exhale as you pull the bar down, inhale as you let it go up.",
      mistakes: [
        "Pulling the bar to the neck instead of the chest.",
        "Leaning far back to cheat the weight up.",
        "Letting the weight slam back down."
      ],
      safety: [
        "Set the thigh pad snug so you cannot swing.",
        "Keep a neutral neck, and do not crane back to reach the bar.",
        "Use a spotter for very heavy loads."
      ],
      easier: [
        "Band pulldown to start, to learn the pattern.",
        "Machine with a lighter stack.",
        "Assisted pull ups on the machine."
      ],
      gallery: ["ex/latpulldown-1.jpg", "ex/latpulldown-2.jpg", "ex/latpulldown-3.jpg", "ex/latpulldown-4.jpg", "ex/latpulldown-5.jpg"]
    },
    {
      id: "legpress", name: "Leg Press", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quadriceps", "Glutes", "Hamstrings"],
      equipment: ["Leg press machine"],
      purpose: "The leg press loads the legs heavily without putting a barbell on your spine, which makes it a safe way to build serious leg strength.",
      start: "Sit in the machine with your back flat against the pad and your feet on the middle of the platform.",
      steps: [
        "Release the safety handles and lower the platform towards you slowly.",
        "Stop when your knees are bent to about 90 degrees, or a little more.",
        "Press the platform away, driving through your heels and glutes.",
        "Lock out carefully without letting your lower back arch off the pad."
      ],
      sets: "3 sets of 10 to 12 reps", reps: "10 to 12 reps", rest: "2 minutes",
      breathing: "Breathe in on the way down, breathe out as you press away.",
      mistakes: [
        "Letting the lower back arch off the pad at the bottom.",
        "Locking the knees hard at the top.",
        "Dropping the platform onto the locks.",
        "Going too low, which loads the lower back."
      ],
      safety: [
        "Keep your lower back flat against the pad the whole time.",
        "Use the safety handles, and do not release them until the weight is locked.",
        "Never lock your knees at the top."
      ],
      easier: [
        "Use a light weight and a narrow stance.",
        "Single leg press, half the load.",
        "Bodyweight squats if the machine is too intimidating."
      ],
      gallery: ["ex/legpress-1.jpg", "ex/legpress-2.jpg"]
    },
    {
      id: "bandlateralraise", name: "Banded Lateral Raise", unit: "reps", type: "count",
      category: "Shoulders", difficulty: "Beginner",
      muscles: ["Side of shoulders", "Traps", "Upper back"],
      equipment: ["Resistance band"],
      purpose: "Lateral raises build the sides of your shoulders, which is what gives a trained upper body its shape.",
      start: "Stand on the middle of a resistance band, holding an end in each hand, with a small bend in your elbows.",
      steps: [
        "Keep a soft bend in your elbows and your ribs down.",
        "Raise your arms out to the sides, leading with your elbows.",
        "Bring your hands to shoulder height, no higher.",
        "Lower slowly back to the start."
      ],
      sets: "3 sets of 12 to 20 reps", reps: "12 to 20 reps", rest: "60 seconds",
      breathing: "Exhale as you raise, inhale as you lower.",
      mistakes: [
        "Shrugging the shoulders up during the lift.",
        "Swinging the arms instead of lifting them.",
        "Going too heavy so the form collapses halfway."
      ],
      safety: [
        "Use a light band and focus on the movement quality.",
        "Keep the band under control so it cannot snap back at your face.",
        "Stop if you feel shoulder pinching."
      ],
      easier: [
        "Seated lateral raise on a machine.",
        "Lighter band.",
        "Lateral raises lying on your side."
      ],
      gallery: ["ex/bandlateralraise-1.jpg", "ex/bandlateralraise-2.jpg", "ex/bandlateralraise-3.jpg"]
    },
    {
      id: "catcow", name: "Cat Cow Stretch", unit: "sec", type: "time",
      category: "Mobility", difficulty: "Beginner",
      muscles: ["Spine", "Core", "Hip flexors", "Shoulders"],
      equipment: ["Mat"],
      purpose: "This gentle mobility drill warms the whole spine, eases a stiff back and prepares the body for training.",
      start: "Kneel on all fours with your hands under your shoulders and your knees under your hips.",
      steps: [
        "Breathe in and drop your belly towards the floor, lifting your chest and tailbone.",
        "Look gently forwards, keeping your neck long.",
        "Breathe out and round your back, tucking your chin and tailbone under.",
        "Move slowly between the two positions for the full time."
      ],
      sets: "2 rounds a day", reps: "Hold each position for 5 to 8 seconds", rest: "Breathe slowly throughout",
      breathing: "Inhale as you arch, exhale as you round. The breath drives the movement.",
      mistakes: [
        "Rushing the movement.",
        "Forcing the range and pushing into pain.",
        "Looking at the floor and cranking the neck."
      ],
      safety: [
        "Move within a comfortable range, especially with any back injury.",
        "Support yourself on a folded towel if your wrists complain.",
        "Stop if you feel sharp back or neck pain."
      ],
      easier: [
        "Seated cat cow on a chair.",
        "Smaller range of movement.",
        "Gentle rocking instead of the full stretch."
      ],
      gallery: ["ex/catcow-1.jpg", "ex/catcow-2.jpg", "ex/catcow-3.jpg", "ex/catcow-4.jpg"]
    },
    {
      id: "hipflexorstretch", name: "Hip Flexor Stretch", unit: "sec", type: "time",
      category: "Mobility", difficulty: "Beginner",
      muscles: ["Hip flexors", "Quadriceps"],
      equipment: ["Mat"],
      purpose: "Long hours of sitting shorten the muscles at the front of your hip. Stretching them makes squats and running feel easier and reduces lower back ache.",
      start: "Kneel on one knee with the other foot flat in front of you, in a half kneeling position.",
      steps: [
        "Tuck your tailbone under and squeeze the glute of the kneeling side.",
        "Shift your hips forward, keeping your torso upright.",
        "Reach the same side arm up and over, feeling the stretch in the front of the hip.",
        "Hold, then change sides."
      ],
      sets: "2 to 3 times a week", reps: "Hold 30 to 45 seconds each side", rest: "15 seconds between sides",
      breathing: "Breathe slowly and deeply, and relax further into the stretch on each exhale.",
      mistakes: [
        "Arching the lower back instead of tucking the tailbone.",
        "Leaning forward, which takes the stretch out of the hip.",
        "Holding a bench and pulling the hip instead of the muscle."
      ],
      safety: [
        "Pad your knee with a towel.",
        "Do not force the stretch if you feel pain in the front of the knee.",
        "Keep a neutral spine rather than arching to go further."
      ],
      easier: [
        "Calf raise at a wall, which stretches the hip flexors standing up.",
        "Lying quad stretch instead.",
        "Shorter holds with more repetitions."
      ],
      gallery: ["ex/hipflexorstretch-1.jpg", "ex/hipflexorstretch-2.jpg"]
    }
  ];

  /* ---------------- equipment + status reports ---------------- */
  var EQUIPMENT = [
    {
      id: "eq1", name: "Treadmill 01", zone: "Cardio", status: "usable",
      lastMaint: "2026-09-28", uses: 12, updatedAt: "2026-10-14T09:12:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq2", name: "Treadmill 02", zone: "Cardio", status: "overused",
      lastMaint: "2026-08-14", uses: 64, updatedAt: "2026-10-15T16:40:00Z",
      report: {
        reason: "Heavy traffic during the evening rush, so the running belt is showing wear.",
        reportedIssue: "Belt slipping slightly at higher speeds and the deck is warm after long sessions.",
        reportedAt: "2026-10-15",
        expectedBack: "2026-10-22",
        safety: "Use at a slower pace for now and stop if the belt slips again.",
        nextAction: "Floor team is reducing the queue limit for this machine each evening.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq3", name: "Dumbbell Rack A", zone: "Weights", status: "usable",
      lastMaint: "2026-10-02", uses: 8, updatedAt: "2026-10-13T11:05:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this rack.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq4", name: "Bench press", zone: "Weights", status: "maintenance",
      lastMaint: "2026-10-10", uses: 0, updatedAt: "2026-10-12T08:30:00Z",
      report: {
        reason: "The safety catch has been replaced as part of the scheduled equipment service.",
        reportedIssue: "The left safety catch was not locking the bar reliably.",
        reportedAt: "2026-10-10",
        expectedBack: "2026-10-18",
        safety: "Do not use this bench until the safety catch is fitted and checked.",
        nextAction: "Replacement catch is fitted and the bench is being tested before it returns to the floor.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq5", name: "Lat pulldown", zone: "Machines", status: "faulty",
      lastMaint: "2026-07-30", uses: 0, updatedAt: "2026-10-11T14:20:00Z",
      report: {
        reason: "A cable has frayed inside the weight stack and is being replaced.",
        reportedIssue: "A member reported a sharp sound and a rough feeling through the cable.",
        reportedAt: "2026-10-11",
        expectedBack: "",
        safety: "Out of service. Please do not use the machine, and report any further changes to the floor team.",
        nextAction: "A replacement cable has been ordered. The fit date has not been confirmed by the supplier yet.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq6", name: "Leg press", zone: "Machines", status: "usable",
      lastMaint: "2026-10-05", uses: 20, updatedAt: "2026-10-14T10:00:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq7", name: "Rowing machine", zone: "Cardio", status: "unusable",
      lastMaint: "2026-06-18", uses: 0, updatedAt: "2026-09-30T07:45:00Z",
      report: {
        reason: "The monitor is not reading the flywheel, so the machine cannot be tracked or booked.",
        reportedIssue: "The console display stayed black during a test and the monitor cable was frayed.",
        reportedAt: "2026-09-28",
        expectedBack: "",
        safety: "Please do not use this machine. Use the second rowing machine on the cardio floor.",
        nextAction: "A replacement monitor cable is being sourced. No firm return date has been given yet.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq8", name: "Cable Crossover", zone: "Machines", status: "maintenance",
      lastMaint: "2026-10-11", uses: 0, updatedAt: "2026-10-12T15:10:00Z",
      report: {
        reason: "The weight stack is being cleaned and the pulleys are being inspected.",
        reportedIssue: "A pulley wheel was reported to catch slightly at the top of the movement.",
        reportedAt: "2026-10-11",
        expectedBack: "2026-10-20",
        safety: "Please do not pull the cables until the inspection is finished.",
        nextAction: "Pulleys are being checked and the stack cleaned before the machine returns.",
        responsible: "Maintenance team"
      }
    }
  ];

  var STATUS_META = {
    usable:      { label: "Usable", pill: "ok",   icon: "✓", desc: "Good to go, safe to use now." },
    maintenance: { label: "Under maintenance", pill: "warn", icon: "🔧", desc: "Servicing in progress, back soon." },
    unusable:    { label: "Not usable", pill: "bad",  icon: "⛔", desc: "Temporarily out of service." },
    faulty:      { label: "Faulty", pill: "bad",  icon: "⚠️", desc: "A fault has been reported, please avoid." },
    overused:    { label: "Overused", pill: "warn", icon: "📈", desc: "Heavy traffic today, try off peak." }
  };

  /* ---------------- food education ---------------- */
  var FOODS = {
    "jollof rice": {
      kcal: 380, carbs: 58, protein: 9, fat: 12, fiber: 3, verdict: "watch",
      photos: ["meal/jollof-rice-1.jpg", "meal/jollof-rice-2.jpg", "meal/jollof-rice-3.jpg", "meal/jollof-rice-4.jpg"],
      photo: "meal/jollof-rice-1.jpg",
      aliases: ["Jollof", "Party jollof", "Benachin", "Riz au gras", "Thieboudienne rice"],
      portion: "One bowl (about 250g)",
      ingredients: ["Rice", "Tomatoes", "Onions", "Cooking oil", "Seasoning", "Sometimes peppers"],
      what: "Jollof rice is rice cooked down in a seasoned tomato sauce until the grains are soft and coated in flavour.",
      contributions: [
        "Carbohydrate is the main fuel here, and it gives you energy for training and for everything else you do in a day.",
        "A little protein from the sauce, though far less than a meal built around meat, fish, eggs or beans.",
        "Some fat from the oil, which is also where most of the calories come from."
      ],
      benefits: "A useful source of quick energy before a session, especially when you train early. Pair it with a protein and some vegetables to turn it into a balanced meal.",
      goals: "Good pre or post training carbohydrate. Watch the portion if your goal is fat loss, and add protein if you are building muscle.",
      servings: "One bowl is a normal serving. Half a bowl is plenty if you are having it alongside beans or meat.",
      swaps: ["Cauliflower rice for a lighter version", "Brown rice for more fibre", "Add a side of grilled chicken, fish or a hard boiled egg for protein"],
      allergens: ["Gluten free if made with rice flour", "Usually contains no dairy", "Check the stock, which often contains gluten or soy"],
      culture: "Jollof is served across West Africa and the style changes by country, from Ghanaian jollof to Senegalese thiéboudienne and Nigerian party jollof.",
      combinations: ["Jollof and fried plantain", "Jollof and coleslaw", "Jollof with grilled fish and a side salad"],
      simple: "Think of it as your engine fuel. It powers your legs, your brain and your session, but it is best balanced with protein and vegetables."
    },
    "grilled chicken": {
      kcal: 165, carbs: 0, protein: 31, fat: 3.6, fiber: 0, verdict: "good",
      photos: ["meal/grilled-chicken-1.jpg", "meal/grilled-chicken-2.jpg"],
      photo: "meal/grilled-chicken-1.jpg",
      aliases: ["Chicken breast", "Grilled chicken breast", "Roast chicken", "Chicken fillet"],
      portion: "One breast (about 150g)",
      ingredients: ["Chicken breast", "Olive oil", "Salt", "Pepper", "Lemon or herbs"],
      what: "Chicken breast grilled over heat with a little oil and seasoning, and nothing else added.",
      contributions: [
        "Protein, which gives your body the building blocks it needs to repair and grow muscle.",
        "Very little carbohydrate, so it is easy to pair with rice, potatoes or bread.",
        "A small amount of fat, mostly from the oil you brushed on."
      ],
      benefits: "One of the easiest high protein foods to prepare. It is filling, it is lean, and it fits almost any plate.",
      goals: "A great everyday choice if you are building muscle or trying to lose fat, because the protein keeps you full and the calories stay sensible.",
      servings: "One breast, roughly the size of your palm, is a normal portion. Two is a large portion for one meal.",
      swaps: ["Grilled fish for a different source", "Chickpeas or lentils for a plant option", "Add a portion of rice or potatoes for energy"],
      allergens: ["Dairy free", "Gluten free", "Check the marinade for soy or gluten"],
      culture: "Grilled chicken is a staple across the world, from jerk chicken in Jamaica to shish taouk in the Middle East and grilled chicken suya in West Africa.",
      combinations: ["Grilled chicken with rice and salad", "Chicken with roasted vegetables", "Chicken and avocado wraps"],
      simple: "This is your muscle repair food. After a workout, the protein helps your body rebuild the parts you just trained."
    },
    "beans": {
      kcal: 240, carbs: 40, protein: 13, fat: 1, fiber: 12, verdict: "good",
      photos: ["meal/beans-1.jpg", "meal/beans-2.jpg"],
      photo: "meal/beans-1.jpg",
      aliases: ["Cooked beans", "Baked beans", "Black beans", "Pinto beans", "Kidney beans", "Ewa agoyin"],
      portion: "One cup cooked (about 170g)",
      ingredients: ["Beans", "Water or stock", "Onions", "Tomatoes", "Spices"],
      what: "Beans are seeds from plants, cooked slowly until they are soft and creamy.",
      contributions: [
        "Fibre, which keeps your digestion happy and helps you feel full for longer.",
        "Plant protein, which supports muscle repair and general repair work in the body.",
        "Slow release carbohydrate, so energy lasts through the morning instead of spiking and dropping."
      ],
      benefits: "Beans are one of the cheapest and most useful foods you can keep in the house. They fill you up, they feed your gut and they count as a real protein source.",
      goals: "Excellent for fat loss because of the fibre and fullness, and a strong choice for muscle building when you eat enough of them.",
      servings: "One cup of cooked beans is a full portion. Two thirds of a cup alongside a grain is a balanced plate.",
      swaps: ["Lentils for a quicker cook", "Chickpeas for a nuttier texture", "Black eyed beans for a stronger flavour"],
      allergens: ["Gluten free", "Usually dairy free", "Check for added oils and salt in tinned versions"],
      culture: "Beans feature in almost every cuisine on earth, from Nigerian akara and ewedu to Brazilian feijoada and American chili.",
      combinations: ["Beans and rice, a classic pairing", "Beans with plantain", "Bean and vegetable soup"],
      simple: "Beans are slow energy and they keep you full, which means you are less likely to snack on the wrong thing later."
    },
    "banana": {
      kcal: 105, carbs: 27, protein: 1.3, fat: 0.4, fiber: 3, verdict: "good",
      photos: ["meal/banana-1.jpg", "meal/banana-2.jpg", "meal/banana-3.jpg"],
      photo: "meal/banana-1.jpg",
      aliases: ["Bananas", "Dessert banana", "Table banana"],
      portion: "One medium banana",
      ingredients: ["Banana"],
      what: "A banana is the fruit of a banana plant, and it is picked green and ripens after it is picked.",
      contributions: [
        "Carbohydrate, which is your quickest useful energy during a session.",
        "Potassium, which helps your muscles contract normally and helps you recover.",
        "Fibre, especially in a slightly less ripe banana, which is good for your gut."
      ],
      benefits: "A genuinely useful pre workout food because it digests quickly, and a good snack when you need energy without a heavy meal.",
      goals: "Great before training. If you are managing your weight, a banana is a filling snack that is easy to portion.",
      servings: "One medium banana is a normal portion. Two is fine before a long or hard session.",
      swaps: ["Dates for a faster digesting option", "Oats for longer lasting energy", "A pear if you want more fibre"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Bananas are eaten across the tropics, from fried plantain in West Africa to banana leaf wrapped dishes in South and South East Asia.",
      combinations: ["Banana with peanut butter", "Banana in a smoothie with oats", "Banana with yoghurt and berries"],
      simple: "A banana is portable energy that your body knows exactly how to use."
    },
    "pizza": {
      kcal: 285, carbs: 36, protein: 12, fat: 10, fiber: 2.5, verdict: "off",
      photos: ["meal/pizza-1.jpg", "meal/pizza-2.jpg", "meal/pizza-3.jpg"],
      photo: "meal/pizza-1.jpg",
      aliases: ["Pizza slice", "Flatbread pizza", "Neapolitan pizza", "Italian pizza"],
      portion: "Two slices",
      ingredients: ["Flour base", "Tomato sauce", "Cheese", "Toppings", "Oil"],
      what: "Pizza is a flat bread base with tomato sauce, cheese and other toppings baked together.",
      contributions: [
        "Carbohydrate from the base, which is your energy.",
        "Protein from the cheese and any meat toppings.",
        "Fat from the cheese and the oil, and that is where a lot of the calories come from."
      ],
      benefits: "Pizza can fit into a healthy diet, especially if you go for a thin base, plenty of vegetables and a protein topping. The trick is the portion and what it is loaded with.",
      goals: "Fine as part of a balanced week. If fat loss is the focus, have a couple of slices with a salad rather than a whole pizza on its own.",
      servings: "Two slices with a side salad is a reasonable meal. A whole pizza is a sharing meal for several people.",
      swaps: ["A thin crust with more vegetables", "A wholegrain base for more fibre", "Chicken or mushroom toppings for more protein"],
      allergens: ["Gluten", "Dairy", "Often soy", "Check for meat and fish in ready made versions"],
      culture: "Pizza is Italian in origin and is now a staple in almost every country, with famous local styles in Naples, New York and Chicago.",
      combinations: ["Pizza with a green salad", "Pizza and a side of olives", "Vegetable pizza with a protein side"],
      simple: "Pizza is mostly energy with a nice bit of protein. Enjoy it, then add something green to the plate."
    },
    "burger": {
      kcal: 550, carbs: 42, protein: 26, fat: 29, fiber: 3, verdict: "off",
      photos: ["meal/burger-1.jpg", "meal/burger-2.jpg", "meal/burger-3.jpg"],
      photo: "meal/burger-1.jpg",
      aliases: ["Hamburger", "Beef burger", "Cheeseburger", "Burger and bun"],
      portion: "One burger",
      ingredients: ["Bread bun", "Beef patty", "Cheese", "Sauce", "Lettuce and tomato"],
      what: "A burger is a patty of ground meat in a bun, usually with cheese, sauce and salad.",
      contributions: [
        "Good amounts of protein from the meat, and B12 and iron as well.",
        "Carbohydrate from the bun.",
        "A large amount of fat from the meat and the cheese, and this is what makes it energy dense."
      ],
      benefits: "A burger is a perfectly good source of protein and iron. The fat and the portion are what make it easier to overdo.",
      goals: "Reasonable occasionally. If your goal is fat loss, a grilled chicken or plant based burger with a salad on the side is the easier choice.",
      servings: "One burger with a side salad is a full meal. Two is a lot for one sitting.",
      swaps: ["Grilled chicken burger for less fat", "Lettuce wraps for fewer calories", "A smaller patty with more vegetables"],
      allergens: ["Gluten", "Dairy", "Sesame in some buns", "Soy in some sauces"],
      culture: "Burgers are an American invention that travelled everywhere, from the biff burger in Nigeria to the街头 burger stalls of East Asia.",
      combinations: ["Burger with a side salad", "Burger with sweet potato wedges", "Burger and a small glass of juice"],
      simple: "A burger is protein with a lot of energy packed in. Have it, enjoy it, and add some vegetables to the plate."
    },
    "salad": {
      kcal: 120, carbs: 10, protein: 3, fat: 7, fiber: 4, verdict: "good",
      photos: ["meal/salad-1.jpg", "meal/salad-2.jpg", "meal/salad-3.jpg"],
      photo: "meal/salad-1.jpg",
      aliases: ["Green salad", "Garden salad", "Side salad", "Mixed salad", "Vegetable salad"],
      portion: "One large bowl",
      ingredients: ["Leafy greens", "Tomatoes", "Cucumber", "Onion", "Olive oil and vinegar"],
      what: "A salad is a mix of raw vegetables, usually with a simple dressing of oil and vinegar.",
      contributions: [
        "Fibre, which fills your stomach and keeps your digestion healthy.",
        "Vitamins and minerals that your body needs to work properly, and that training burns through.",
        "Very little energy, so it is easy to eat a large portion without overdoing it."
      ],
      benefits: "Salad is the easiest way to add volume and fibre to a meal. It makes any plate better and helps you feel full.",
      goals: "Excellent for fat loss because you can eat a big volume for very few calories. Add beans, egg, chicken or tuna to make it a full meal.",
      servings: "A large bowl is a normal portion. Add a protein and it becomes a meal.",
      swaps: ["Add grilled chicken, tuna, boiled egg or chickpeas", "Use yoghurt dressing for a lighter option", "Add whole grains for a fuller bowl"],
      allergens: ["Gluten free", "Dairy free unless the dressing has some", "Check croutons and dressings for hidden allergens"],
      culture: "Salads appear in every cuisine in some form, from the Mediterranean olive and tomato salad to West African leaves and stews.",
      combinations: ["Salad with grilled chicken", "Salad with tuna and beans", "Salad with feta and olives"],
      simple: "Salad is the food that helps you feel full without eating a lot of calories. Put it next to anything and the meal improves."
    },
    "suya": {
      kcal: 290, carbs: 5, protein: 28, fat: 18, fiber: 1, verdict: "watch",
      photos: ["meal/suya-1.jpg", "meal/suya-2.jpg", "meal/suya-3.jpg"],
      photo: "meal/suya-1.jpg",
      aliases: ["Suya", "Tsire", "Kilishi", "Yaji beef", "Beef skewers", "Meat sticks"],
      portion: "Three to five skewers",
      ingredients: ["Beef", "Groundnut", "Chilli pepper", "Ginger", "Spices"],
      what: "Suya is spiced, seasoned skewered beef, usually coated with groundnut and chilli and cooked over charcoal.",
      contributions: [
        "Plenty of protein, which supports muscle repair and keeps you full.",
        "Fat from the beef and the groundnut coating.",
        "Very little carbohydrate, so it works well with a starchy side."
      ],
      benefits: "A great high protein street food, full of flavour and quick to eat on the move after training.",
      goals: "A good protein choice. Balance it with vegetables and a moderate portion if you are watching calories.",
      servings: "Three to five skewers is a normal portion.",
      swaps: ["Chicken or fish suya for a lighter option", "Yoghurt and cucumber on the side", "Skip the sugary drinks that usually come with it"],
      allergens: ["Gluten free", "Contains groundnut, which is a serious allergen", "Often contains soya"],
      culture: "Suya is a northern Nigerian staple, eaten at street stalls and during family gatherings, and it is a staple across West Africa.",
      combinations: ["Suya with cold drinks and fried plantain", "Suya with a fresh salad", "Suya with yaji spiced plantain"],
      simple: "Suya is strong protein with a spicy, nutty coating. Enjoy it with something green alongside."
    },
    "swallow": {
      kcal: 320, carbs: 70, protein: 3, fat: 1, fiber: 2, verdict: "watch",
      photos: ["meal/swallow-1.jpg", "meal/swallow-2.jpg"],
      photo: "meal/swallow-1.jpg",
      aliases: ["Fufu", "Eba", "Amala", "Pounded yam", "Semo", "Wheat swallow", "Banku"],
      portion: "One piece",
      ingredients: ["Cassava flour", "Water", "Coconut"],
      what: "Swallow is a smooth, stretchy dough made from cassava flour and water, eaten with a soup or stew.",
      contributions: [
        "Almost all carbohydrate, which makes it a very effective energy source.",
        "Very little protein and fat on its own, because it is a plain starch.",
        "A little fibre from the cassava."
      ],
      benefits: "A high energy staple that travels well and pairs with nutritious soups. On its own though, it is missing protein.",
      goals: "Fine as a filling energy source. Always eat it with a soup or stew that contains beans, meat or fish for a balanced plate.",
      servings: "One piece is a normal portion. Two pieces with a rich soup is a full meal.",
      swaps: ["Eat with a protein rich stew instead of a plain soup", "Try a mixed grain dough for more fibre", "Add beans or egg to the plate"],
      allergens: ["Gluten free", "Dairy free", "Check the soup for allergens, which is where they usually come from"],
      culture: "Swallow, or fufu, is a staple across West and Central Africa, served with soups such as egusi, okra and banga.",
      combinations: ["Swallow with egusi soup", "Swallow with okra soup", "Swallow with beans and plantain"],
      simple: "Swallow is pure energy, like a big bowl of rice. Eat it with a stew that has beans or meat and the meal is complete."
    },
    "egg": {
      kcal: 78, carbs: 0.6, protein: 6, fat: 5, fiber: 0, verdict: "good",
      photos: ["meal/egg-1.jpg", "meal/egg-2.jpg", "meal/egg-3.jpg"],
      photo: "meal/egg-1.jpg",
      aliases: ["Boiled egg", "Fried egg", "Scrambled egg", "Eggs", "Omelette"],
      portion: "One to three eggs",
      ingredients: ["Egg"],
      what: "An egg is a simple, complete food. It has protein, fat and a little carbohydrate, plus a wide range of vitamins and minerals.",
      contributions: [
        "High quality protein, which makes it one of the best protein sources per gram.",
        "Fat, including the healthy kind found in the yolk.",
        "Choline, which supports your brain and nervous system, plus vitamins A, D, E and B12."
      ],
      benefits: "Eggs are cheap, quick and one of the most complete foods you can eat. They are also very easy to add to almost any meal.",
      goals: "A brilliant everyday protein source for muscle building, and a convenient fat loss food because one egg is only 78 calories.",
      servings: "One to three eggs is a normal portion.",
      swaps: ["Boiled, poached or scrambled rather than fried", "Add vegetables to a scramble for volume", "Use whites only if you need to cut the fat"],
      allergens: ["Egg, which is a common allergen", "Gluten free", "Dairy free"],
      culture: "Eggs appear in cuisines worldwide, from Nigerian egg sauce and suya eggs to French omelette and Japanese tamago.",
      combinations: ["Eggs with spinach on toast", "Egg and avocado", "Boiled eggs with fruit for breakfast"],
      simple: "An egg is a tiny package of everything your body needs to repair itself. It is the easiest protein to add to your day."
    },
    "oatmeal": {
      kcal: 150, carbs: 27, protein: 5, fat: 3, fiber: 4, verdict: "good",
      photos: ["meal/oatmeal-1.jpg", "meal/oatmeal-2.jpg", "meal/oatmeal-3.jpg"],
      photo: "meal/oatmeal-1.jpg",
      aliases: ["Oats", "Porridge", "Oat porridge", "Oat porridge", "Britten", "Pap"],
      portion: "One cup cooked",
      ingredients: ["Oats", "Water or milk", "Optional fruit, nuts and cinnamon"],
      what: "Oatmeal is rolled oats cooked in water or milk until they thicken into a warm porridge.",
      contributions: [
        "Slow release carbohydrate, so energy arrives steadily instead of spiking and crashing.",
        "Fibre, especially a type called beta glucan, which is well known for being good for your heart and for fullness.",
        "A modest amount of protein, which you can boost by cooking it in milk or adding yoghurt."
      ],
      benefits: "A dependable breakfast that keeps you full until lunch. It is inexpensive, keeps for days and is easy to make bigger when you are hungry.",
      goals: "A great slow carbohydrate before a long session or on a rest day. Add milk and a protein source to make it a fuller meal.",
      servings: "One cup cooked is a normal portion. Two is a bigger breakfast.",
      swaps: ["Add milk, yoghurt or a scoop of protein powder", "Add berries and a spoon of groundnut", "Try a mixed oat and barley blend for more fibre"],
      allergens: ["Often contains gluten unless certified gluten free oats", "Dairy free if cooked in water", "Check for nuts in toppings"],
      culture: "Oats have been eaten in Scotland and the north of England for centuries, and are now a breakfast staple worldwide.",
      combinations: ["Oats with milk, banana and cinnamon", "Overnight oats with yoghurt and berries", "Oats with a boiled egg on the side"],
      simple: "Oats are slow energy that keeps you full. Make it with milk and add fruit and you have a genuinely balanced breakfast."
    },
    "white rice": {
      kcal: 205, carbs: 45, protein: 4, fat: 0.4, fiber: 0.6, verdict: "watch", emoji: "🍚",
      aliases: ["Rice", "Steamed rice", "Boiled rice", "White rice grains"],
      portion: "One cup cooked (about 158g)",
      ingredients: ["White rice", "Water", "Salt"],
      what: "White rice is rice with the husk, bran and germ removed, then cooked until soft.",
      contributions: [
        "Carbohydrate, your body's main and quickest source of training energy.",
        "Very little protein or fat, so it needs a protein beside it.",
        "Almost no fibre, because the bran layer is what gets removed."
      ],
      benefits: "Easy to digest, cheap, and a dependable energy base for almost any meal, especially around training.",
      goals: "Good fuel before or after a session. If you are losing weight, keep the portion to a fist size and load the plate with protein and vegetables.",
      servings: "One cup cooked is a normal portion. Half a cup if it is a side dish.",
      swaps: ["Brown rice for more fibre", "Cauliflower rice for far fewer calories", "Add beans, chicken or egg for protein"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Rice is the staple for more than half the world, from Japanese steamed rice to Nigerian party rice and Indian basmati.",
      combinations: ["Rice and beans", "Rice with chicken and vegetables", "Rice with fish and a side salad"],
      simple: "White rice is clean energy. Add a protein and something green and the plate is balanced."
    },
    "fried rice": {
      kcal: 340, carbs: 42, protein: 10, fat: 14, fiber: 2, verdict: "watch", emoji: "🍛",
      aliases: ["Stir fried rice", "Chinese fried rice", "Party fried rice"],
      portion: "One plate (about 250g)",
      ingredients: ["Rice", "Oil", "Egg", "Vegetables", "Soy sauce", "Sometimes meat"],
      what: "Fried rice is cooked rice stir fried in oil with egg, vegetables and often meat or shrimp.",
      contributions: [
        "Carbohydrate from the rice for energy.",
        "Protein from the egg and any meat mixed through it.",
        "Fat from the oil it is fried in, which is where many of the calories sit."
      ],
      benefits: "A full meal in one pan, and a good way to use up leftover rice and vegetables.",
      goals: "Fine in a moderate portion. Ask for less oil if you can, and add extra egg or chicken to raise the protein.",
      servings: "One plate is a full meal. Share a takeaway portion if it is very large.",
      swaps: ["Brown rice for more fibre", "Extra vegetables for volume", "More egg or chicken for protein"],
      allergens: ["Egg", "Soy", "Gluten in soy sauce", "Shellfish in some versions"],
      culture: "Fried rice is claimed across Asia, from Chinese chǎofàn to Nigerian fried rice served at parties and celebrations.",
      combinations: ["Fried rice with a protein side", "Fried rice with steamed vegetables", "Fried rice with a simple salad"],
      simple: "Fried rice is energy with a bit of protein. Watch the oil, and make the portion honest."
    },
    "bread": {
      kcal: 265, carbs: 49, protein: 9, fat: 3.2, fiber: 2.7, verdict: "watch", emoji: "🍞",
      aliases: ["Loaf", "Sliced bread", "White bread", "Wholewheat bread", "Wheat bread"],
      portion: "Two slices",
      ingredients: ["Flour", "Water", "Yeast", "Salt", "Sometimes sugar and oil"],
      what: "Bread is a baked food made from a dough of flour and water, risen with yeast.",
      contributions: [
        "Carbohydrate, which is your main energy.",
        "A little protein from the wheat.",
        "Some fibre, more in wholemeal than in white."
      ],
      benefits: "Cheap, filling and easy to pair with protein. Wholegrain versions keep you full for longer.",
      goals: "Useful quick energy. Choose wholegrain for more fibre, and pair with egg, fish or beans to make it a meal.",
      servings: "Two slices is a normal portion. One slice if it is a side.",
      swaps: ["Wholegrain or brown bread for more fibre", "Egg or avocado on top for protein and healthy fat", "A thinner slice to cut the carbs"],
      allergens: ["Gluten", "Wheat", "Sometimes sesame or soy in seeded loaves"],
      culture: "Bread is a staple on every continent, from Nigerian Agege bread to French baguette, Indian naan and American sandwich bread.",
      combinations: ["Bread with egg and avocado", "Bread with beans", "Bread with tuna and salad"],
      simple: "Bread is quick energy. Make it wholegrain and put something protein on top."
    },
    "indomie": {
      kcal: 380, carbs: 52, protein: 8, fat: 14, fiber: 2, verdict: "off", emoji: "🍜",
      aliases: ["Instant noodles", "Noodles", "Indomie noodles", "Cup noodles", "Ramen"],
      portion: "One packet",
      ingredients: ["Wheat noodles", "Palm oil", "Salt", "Seasoning", "Sometimes chilli"],
      what: "Indomie and other instant noodles are pre cooked, dried wheat noodles with a packet of oil and seasoning.",
      contributions: [
        "Carbohydrate from the wheat, which is the bulk of it.",
        "A little protein, though far less than a real protein source.",
        "A lot of salt and a fair amount of oil, and very little else."
      ],
      benefits: "Fast, cheap and filling. It is comfort food rather than fuel, and it works as an occasional meal.",
      goals: "Not ideal for fat loss or muscle building on its own. Add an egg or some chicken and vegetables to make it worth eating.",
      servings: "One packet is a portion. Half a packet with added protein is the smarter move.",
      swaps: ["Add a boiled or fried egg for protein", "Throw in vegetables", "Try a wholegrain or lower salt noodle"],
      allergens: ["Gluten", "Wheat", "Soy", "Sometimes egg in the noodles"],
      culture: "Instant noodles are a global convenience food, eaten plainly in Nigeria, as ramen in Japan and with spice in Korea.",
      combinations: ["Noodles with a boiled egg", "Noodles with chicken and vegetables", "Noodles with a side salad"],
      simple: "Instant noodles are mostly salt and carbs. Add an egg and some vegetables and it becomes a real meal."
    },
    "spaghetti": {
      kcal: 220, carbs: 43, protein: 8, fat: 1.3, fiber: 2.5, verdict: "watch", emoji: "🍝",
      aliases: ["Pasta", "Noodles", "Macaroni", "Spaghetti bolognese", "Pasta noodles"],
      portion: "One cup cooked (about 140g)",
      ingredients: ["Durum wheat pasta", "Water", "Salt"],
      what: "Spaghetti is a long, thin pasta made from durum wheat and water, boiled until soft.",
      contributions: [
        "Carbohydrate, which is steady, useful energy.",
        "A modest amount of protein from the wheat.",
        "A little fibre, more in wholewheat pasta."
      ],
      benefits: "A reliable energy base that pairs with any sauce, and a good pre-training carbohydrate.",
      goals: "Great before a hard session. Keep the portion to a cup and load the sauce with vegetables and lean meat.",
      servings: "One cup cooked is a normal portion. It doubles when cooked, so measure it dry.",
      swaps: ["Wholewheat pasta for more fibre", "Add lean mince, chicken or tuna", "Use a tomato base rather than a creamy one"],
      allergens: ["Gluten", "Wheat", "Check fresh pasta for egg"],
      culture: "Pasta is Italian at heart and now eaten everywhere, from spaghetti bolognese to Nigerian spaghetti jollof.",
      combinations: ["Pasta with a tomato and meat sauce", "Pasta with tuna and vegetables", "Pasta with a green salad"],
      simple: "Pasta is steady energy. Keep the portion honest and make the sauce do the nutritional work."
    },
    "plantain": {
      kcal: 122, carbs: 31, protein: 1.3, fat: 0.3, fiber: 2.3, verdict: "good", emoji: "🍌",
      aliases: ["Fried plantain", "Boiled plantain", "Dodo", "Cooking banana", "Alocado"],
      portion: "One medium piece",
      ingredients: ["Plantain", "Sometimes oil for frying"],
      what: "Plantain is a starchy relative of the banana, eaten cooked rather than raw.",
      contributions: [
        "Carbohydrate, which is your main energy.",
        "Potassium, which supports normal muscle function.",
        "A little fibre, especially when it is less ripe."
      ],
      benefits: "Filling, energising and easy to cook in many ways. Boiling keeps the calories far lower than frying.",
      goals: "Good energy around training. Boil rather than fry if you are managing your weight.",
      servings: "One medium plantain is a normal portion. A few fried slices is a side.",
      swaps: ["Boil or grill instead of frying", "Pair with beans or egg for protein", "Use a ripe one for natural sweetness instead of sugar"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Plantain is a staple across West Africa, the Caribbean and Latin America, from fried dodo to boiled plantain and tostones.",
      combinations: ["Plantain and beans", "Boiled plantain with a vegetable soup", "Plantain with egg"],
      simple: "Plantain is warm, useful energy. Boil it, and add a protein to complete the plate."
    },
    "yam": {
      kcal: 118, carbs: 28, protein: 1.5, fat: 0.1, fiber: 3.9, verdict: "good", emoji: "🍠",
      aliases: ["Boiled yam", "Fried yam", "Pounded yam", "Yam porridge", "Dioscorea"],
      portion: "One cup cubed",
      ingredients: ["Yam", "Water", "Sometimes oil"],
      what: "Yam is a starchy tuber with dry, white flesh, cooked by boiling, frying or pounding.",
      contributions: [
        "Carbohydrate for steady energy.",
        "Fibre, more than most white staples, which helps with fullness.",
        "Vitamin C and potassium in useful amounts."
      ],
      benefits: "A wholesome, filling staple that gives slow energy and pairs well with soups and stews.",
      goals: "A good everyday carbohydrate. Keep the portion to a cup and pair it with a protein-rich soup.",
      servings: "One cup cubed is a normal portion.",
      swaps: ["Boil instead of fry", "Pair with a bean or fish soup", "Try yam and vegetables for a lighter plate"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Yam is central to West African food, celebrated at yam festivals and eaten as pounded yam, porridge and fried yam.",
      combinations: ["Yam with egg sauce", "Yam with a vegetable soup", "Yam and beans"],
      simple: "Yam is slow, honest energy with real fibre. Pair it with a soup that has protein."
    },
    "potato": {
      kcal: 161, carbs: 37, protein: 4.3, fat: 0.2, fiber: 3.8, verdict: "good", emoji: "🥔",
      aliases: ["Boiled potato", "Baked potato", "Jacket potato", "Sweet potato", "Mashed potato"],
      portion: "One medium potato",
      ingredients: ["Potato", "Sometimes butter or oil"],
      what: "The potato is a starchy tuber, boiled, baked, mashed or fried, and one of the most eaten foods on earth.",
      contributions: [
        "Carbohydrate for energy.",
        "More potassium than a banana, which helps muscles work normally.",
        "Fibre, especially in the skin, which helps you feel full."
      ],
      benefits: "Filling, versatile and genuinely satisfying. A plain boiled or baked potato is one of the most fullness-per-calorie foods there is.",
      goals: "Excellent around training. Keep the skin on and go easy on the butter if you are losing weight.",
      servings: "One medium potato is a normal portion.",
      swaps: ["Bake or boil instead of frying", "Keep the skin on for more fibre", "Use yoghurt instead of butter for a lighter mash"],
      allergens: ["Gluten free", "Dairy free unless mashed with milk", "No common allergens"],
      culture: "Potatoes feed the world, from Irish champ to Nigerian fried potato and South American papas.",
      combinations: ["Potato with grilled fish or chicken", "Baked potato with beans", "Potato with a vegetable salad"],
      simple: "Potato is filling energy that keeps you satisfied. Keep it simple and keep the skin on."
    },
    "salmon": {
      kcal: 208, carbs: 0, protein: 20, fat: 13, fiber: 0, verdict: "good", emoji: "🐟",
      aliases: ["Grilled salmon", "Smoked salmon", "Baked salmon", "Fish fillet"],
      portion: "One fillet (about 120g)",
      ingredients: ["Salmon", "Lemon", "Herbs", "A little oil"],
      what: "Salmon is an oily fish, grilled, baked or smoked, known for its rich flavour and pink flesh.",
      contributions: [
        "High quality protein to repair and build muscle.",
        "Omega-3 fats, which are good for the heart, the brain and recovery.",
        "Vitamin D and B12, which many people fall short on."
      ],
      benefits: "One of the best proteins you can eat. The omega-3s also help with the inflammation that training causes.",
      goals: "Excellent for muscle building and general health, and a smart fatty fish to eat twice a week.",
      servings: "One fillet is a normal portion.",
      swaps: ["Canned salmon for a cheaper option", "Mackerel or sardines for similar omega-3", "Add a potato or rice for energy"],
      allergens: ["Fish", "Dairy free", "Gluten free"],
      culture: "Salmon is eaten from Japanese sashimi to Scottish smoked salmon and grilled fillets across the West.",
      combinations: ["Salmon with rice and vegetables", "Salmon with a potato and salad", "Salmon in a wrap with greens"],
      simple: "Salmon is top tier protein with healthy fats. It repairs muscle and looks after your heart."
    },
    "tuna": {
      kcal: 130, carbs: 0, protein: 28, fat: 1, fiber: 0, verdict: "good", emoji: "🐟",
      aliases: ["Canned tuna", "Tinned tuna", "Tuna fish", "Raw tuna", "Tataki"],
      portion: "One can drained (about 120g)",
      ingredients: ["Tuna", "Sometimes water or oil", "Salt"],
      what: "Tuna is a lean, firm fish, eaten fresh or canned in water or oil.",
      contributions: [
        "A lot of lean protein, which makes it one of the most efficient protein foods.",
        "Very little fat if it is packed in water.",
        "Selenium and vitamin B12."
      ],
      benefits: "Cheap, long lasting and almost pure protein. It is the easiest way to raise the protein on any plate.",
      goals: "Brilliant for muscle building and fat loss, because it is very high in protein for very few calories.",
      servings: "One can drained is a normal portion.",
      swaps: ["Choose tuna in water over oil to cut calories", "Add it to a salad or a sandwich", "Mix with yoghurt instead of mayonnaise"],
      allergens: ["Fish", "Gluten free", "Dairy free"],
      culture: "Tuna is eaten worldwide, from Japanese sushi to Nigerian tuna sauce and Mediterranean salads.",
      combinations: ["Tuna and salad", "Tuna in a sandwich with vegetables", "Tuna with rice and beans"],
      simple: "Tuna is lean, cheap protein. It is the fastest way to make any plate more filling."
    },
    "goat meat": {
      kcal: 143, carbs: 0, protein: 27, fat: 3, fiber: 0, verdict: "good", emoji: "🍖",
      aliases: ["Goat", "Mutton", "Bush meat", "Asun", "Roasted goat"],
      portion: "One serving (about 120g)",
      ingredients: ["Goat meat", "Spices", "Sometimes onions"],
      what: "Goat meat is the meat of a goat, roasted, grilled or cooked down in a stew.",
      contributions: [
        "High quality protein to build and repair muscle.",
        "Iron and zinc, which support energy and the immune system.",
        "Less fat than many other red meats."
      ],
      benefits: "A strong, lean red meat that is lower in fat than beef and rich in iron.",
      goals: "Good for muscle building. Choose grilled or stewed over fried, and keep the portion sensible.",
      servings: "One palm-sized serving is a normal portion.",
      swaps: ["Grill instead of frying", "Chicken breast for an even leaner option", "Add vegetables to the stew"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Goat meat is prized across West Africa, the Caribbean and the Middle East, from asun to curry goat and mutton stew.",
      combinations: ["Goat with rice and salad", "Goat in a vegetable soup", "Goat with yam or plantain"],
      simple: "Goat is lean, iron-rich red meat. It builds muscle without the extra fat of beef."
    },
    "turkey": {
      kcal: 135, carbs: 0, protein: 30, fat: 1, fiber: 0, verdict: "good", emoji: "🦃",
      aliases: ["Turkey breast", "Ground turkey", "Minced turkey", "Roast turkey"],
      portion: "One serving (about 120g)",
      ingredients: ["Turkey", "Herbs", "A little oil"],
      what: "Turkey is a lean poultry, most often the breast, grilled, roasted or minced.",
      contributions: [
        "Very high quality protein, more per serving than most meats.",
        "Very little fat, especially from the breast.",
        "B vitamins that help turn food into energy."
      ],
      benefits: "One of the leanest proteins available. It is filling, versatile and easy to prepare in bulk.",
      goals: "Ideal for both muscle building and fat loss, since the protein is high and the fat is very low.",
      servings: "One palm-sized serving is a normal portion.",
      swaps: ["Chicken breast as a close alternative", "Minced turkey for quick cooking", "Add a starch for energy"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Turkey is eaten worldwide, from American Thanksgiving roast to Turkish kebabs and everyday grilled breast.",
      combinations: ["Turkey with rice and vegetables", "Turkey in a wrap with salad", "Turkey with potatoes"],
      simple: "Turkey is lean, high protein fuel. It is one of the easiest foods to build a muscle meal around."
    },
    "milk": {
      kcal: 122, carbs: 12, protein: 8, fat: 4.8, fiber: 0, verdict: "good", emoji: "🥛",
      aliases: ["Cow milk", "Whole milk", "Semi skimmed milk", "Fresh milk", " dairy milk"],
      portion: "One glass (about 240ml)",
      ingredients: ["Milk"],
      what: "Milk is the nourishing liquid produced by mammals, most often a cow, drunk plain or used in cooking.",
      contributions: [
        "Protein, including both casein and whey, which support muscle.",
        "Calcium, which keeps bones and teeth strong.",
        "Vitamin B12 and riboflavin."
      ],
      benefits: "A simple way to add protein and calcium. It is useful after training or as the base of a filling breakfast.",
      goals: "Good for muscle building. Choose semi skimmed or skimmed if you are watching calories.",
      servings: "One glass is a normal serving.",
      swaps: ["Semi skimmed or skimmed milk to cut fat", "Unsweetened soy milk for a plant option", "Add it to oats or a smoothie"],
      allergens: ["Dairy", "Lactose", "Gluten free"],
      culture: "Milk is drunk plain across the world and is central to chai, horchata, and many cereal and cooking traditions.",
      combinations: ["Milk with oats", "Milk in a fruit smoothie", "Milk with a protein shake"],
      simple: "Milk is protein and calcium in a glass. It is an easy way to add to your daily protein."
    },
    "yoghurt": {
      kcal: 100, carbs: 7, protein: 17, fat: 0.7, fiber: 0, verdict: "good", emoji: "🥣",
      aliases: ["Yogurt", "Greek yoghurt", "Plain yoghurt", "Curd", "Dahi"],
      portion: "One pot (about 170g)",
      ingredients: ["Milk", "Live cultures"],
      what: "Yoghurt is milk fermented with friendly bacteria, plain or flavoured, and Greek yoghurt is strained to be thicker and higher in protein.",
      contributions: [
        "A lot of protein, especially in the Greek style, which keeps you full.",
        "Calcium for bones.",
        "Live cultures that support gut health."
      ],
      benefits: "One of the best snack proteins. It is filling, good for the gut, and endlessly useful in cooking and breakfasts.",
      goals: "Excellent for muscle building and fat loss. Choose plain, unsweetened yoghurt to avoid added sugar.",
      servings: "One pot is a normal snack. Two is a light meal with fruit.",
      swaps: ["Greek yoghurt for more protein", "Add fruit and a spoon of oats", "Use it in place of cream or mayonnaise"],
      allergens: ["Dairy", "Lactose", "Gluten free"],
      culture: "Yoghurt is eaten from plain dahi in India to Turkish ayran and strained labneh across the Middle East.",
      combinations: ["Yoghurt with berries and honey", "Yoghurt with banana and nuts", "Yoghurt as a sauce for savoury dishes"],
      simple: "Yoghurt is high protein and good for your gut. Keep it plain and add your own fruit."
    },
    "cheese": {
      kcal: 113, carbs: 0.9, protein: 7, fat: 9, fiber: 0, verdict: "watch", emoji: "🧀",
      aliases: ["Cheddar", "Mozzarella", "Gouda", "Processed cheese", "Cheese slice"],
      portion: "One slice or about 30g",
      ingredients: ["Milk", "Cultures", "Salt", "Rennet"],
      what: "Cheese is milk pressed and aged into a solid food, in hundreds of styles from soft to hard.",
      contributions: [
        "Protein, which supports muscle.",
        "Calcium and vitamin D for bones.",
        "A lot of fat, which is where most of the calories come from."
      ],
      benefits: "Tasty, filling and rich in calcium. A little goes a long way because it is so energy dense.",
      goals: "Fine in small amounts. Grate rather than slice thickly if you are watching calories, and watch it on a diet.",
      servings: "One small slice or 30g is a portion.",
      swaps: ["A stronger cheese so you use less", "Low fat cheese", "Use nutritional yeast for a lower calorie topping"],
      allergens: ["Dairy", "Lactose", "Gluten free"],
      culture: "Cheese is made and loved everywhere, from Nigerian wara to French brie, Italian mozzarella and Dutch gouda.",
      combinations: ["Cheese in an omelette", "Cheese with wholegrain bread", "Cheese and apple as a snack"],
      simple: "Cheese is protein and calcium, but energy dense. Enjoy a little, not a lot."
    },
    "orange": {
      kcal: 62, carbs: 15, protein: 1.2, fat: 0.2, fiber: 3.1, verdict: "good", emoji: "🍊",
      aliases: ["Sweet orange", "Navel orange", "Tangerine", "Mandarin", "Clementine"],
      portion: "One medium orange",
      ingredients: ["Orange"],
      what: "An orange is a citrus fruit with a sweet, juicy segmented flesh and a thick peel.",
      contributions: [
        "Vitamin C, which supports the immune system and helps recovery.",
        "Fibre, which steadies the sugar and keeps you full.",
        "Water, so it helps with hydration."
      ],
      benefits: "A genuinely useful snack: hydrating, high in vitamin C and easy to carry.",
      goals: "Great as a pre workout snack or a sweet fix that is not candy. Whole fruit beats the juice every time.",
      servings: "One orange is a normal portion.",
      swaps: ["Eat it whole rather than juiced for the fibre", "Pair with nuts or yoghurt", "Try other citrus for variety"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Oranges are grown across the tropics and subtropics, from Nigerian sweet oranges to Spanish Valencia oranges.",
      combinations: ["Orange with yoghurt", "Orange as a pre workout snack", "Orange in a fruit salad"],
      simple: "An orange is vitamin C and fibre in a handy package. Whole fruit is always better than juice."
    },
    "apple": {
      kcal: 95, carbs: 25, protein: 0.5, fat: 0.3, fiber: 4.4, verdict: "good", emoji: "🍎",
      aliases: ["Green apple", "Red apple", "Fruit apple", "Eating apple"],
      portion: "One medium apple",
      ingredients: ["Apple"],
      what: "An apple is a crisp pomaceous fruit with sweet or tart flesh and a thin skin.",
      contributions: [
        "Fibre, including pectin, which is good for the gut and for fullness.",
        "Vitamin C and a range of antioxidants.",
        "Slow release sugar for a gentle lift."
      ],
      benefits: "Portable, crunchy and genuinely filling. It is one of the easiest snacks to reach for instead of something sweet.",
      goals: "A great snack for fat loss because the fibre and water fill you up for very few calories.",
      servings: "One apple is a normal portion.",
      swaps: ["Pair with peanut butter for protein", "Eat it with the skin on for more fibre", "Try it with a handful of nuts"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Apples are grown in temperate regions worldwide, from Nigerian apple treats to American pie and British cider.",
      combinations: ["Apple with peanut butter", "Apple in a fruit salad", "Apple with yoghurt"],
      simple: "An apple is fibre and natural sweetness. It is the easy snack that keeps you full."
    },
    "mango": {
      kcal: 99, carbs: 25, protein: 1.4, fat: 0.6, fiber: 2.6, verdict: "good", emoji: "🥭",
      aliases: ["Sweet mango", "Chunsa mango", "Alphonso", "Mangifera", "Mango fruit"],
      portion: "One cup sliced",
      ingredients: ["Mango"],
      what: "Mango is a sweet tropical stone fruit with soft, orange flesh and a large flat seed.",
      contributions: [
        "Vitamin C and vitamin A, both good for immunity and the skin.",
        "Natural sugar for quick energy.",
        "Some fibre, which slows the sugar a little."
      ],
      benefits: "Sweet, hydrating and rich in vitamins. A good way to satisfy a sweet tooth naturally.",
      goals: "A nice treat and a decent pre workout snack. Because it is sugary, enjoy a cup rather than a whole fruit if you are losing weight.",
      servings: "One cup sliced is a normal portion.",
      swaps: ["Eat it fresh rather than in syrup", "Pair with yoghurt for protein", "Try it in a smoothie with greens"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Mango is a beloved tropical fruit, from Indian alphonso mangoes to Nigerian sweet mango and Filipino carabao mango.",
      combinations: ["Mango with yoghurt", "Mango in a smoothie", "Mango with chilli and lime as a snack"],
      simple: "Mango is sweet, vitamin rich energy. Enjoy a cup, and let it stand in for candy."
    },
    "watermelon": {
      kcal: 30, carbs: 7.6, protein: 0.6, fat: 0.2, fiber: 0.4, verdict: "good", emoji: "🍉",
      aliases: ["Water melon", "Melon", "Seedless watermelon", "Tangra melon"],
      portion: "One cup cubed",
      ingredients: ["Watermelon"],
      what: "Watermelon is a large, watery melon with sweet red flesh and a green rind.",
      contributions: [
        "A lot of water, so it hydrates you well.",
        "Lycopene, an antioxidant linked with heart health.",
        "Some vitamin C, for very few calories."
      ],
      benefits: "One of the most hydrating and lowest calorie foods you can eat. Perfect after training or on a hot day.",
      goals: "Excellent for fat loss because you can eat a large amount for almost nothing. A great natural sweet fix.",
      servings: "One or two cups is a normal portion.",
      swaps: ["Eat it fresh rather than as juice", "Add a pinch of salt and lime after training", "Pair with feta and mint for a savoury twist"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Watermelon is eaten across the tropics and in summer everywhere, often shared cold from the whole fruit.",
      combinations: ["Watermelon after a workout", "Watermelon with feta and mint", "Watermelon in a fruit salad"],
      simple: "Watermelon is water and natural sugar. It hydrates and satisfies with almost no calories."
    },
    "pineapple": {
      kcal: 82, carbs: 22, protein: 0.9, fat: 0.2, fiber: 2.3, verdict: "good", emoji: "🍍",
      aliases: ["Pine apple", "Ananas", "Sweet pineapple", "Tropical pineapple"],
      portion: "One cup chunks",
      ingredients: ["Pineapple"],
      what: "Pineapple is a tropical fruit with sweet, tangy yellow flesh and a spiky skin.",
      contributions: [
        "Vitamin C, which supports immunity and recovery.",
        "Bromelain, an enzyme that helps digest protein.",
        "Natural sugar for quick energy."
      ],
      benefits: "Sweet, juicy and rich in vitamin C. Bromelain may also help with the soreness after hard training.",
      goals: "A good sweet snack and a decent pre workout food. Keep to a cup if you are watching sugar.",
      servings: "One cup chunks is a normal portion.",
      swaps: ["Eat it fresh rather than in syrup", "Add to a savoury dish with chicken", "Pair with yoghurt for protein"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Pineapple is a tropical staple, from Nigerian pineapple chunks to Brazilian caipirinha and Hawaiian pizza debates.",
      combinations: ["Pineapple with yoghurt", "Pineapple with grilled chicken", "Pineapple in a fruit salad"],
      simple: "Pineapple is sweet, tangy vitamin C. It also helps your body digest protein."
    },
    "grapes": {
      kcal: 62, carbs: 16, protein: 0.6, fat: 0.2, fiber: 0.9, verdict: "good", emoji: "🍇",
      aliases: ["Table grapes", "Red grapes", "Black grapes", "Green grapes", "Sultanas", "Raisins"],
      portion: "One cup",
      ingredients: ["Grapes"],
      what: "Grapes are small, juicy fruits that grow in bunches, eaten fresh, dried as raisins, or pressed into wine.",
      contributions: [
        "Natural sugar for a quick energy lift.",
        "Antioxidants such as resveratrol, linked with heart health.",
        "Some water, so they help with hydration."
      ],
      benefits: "A sweet, portable snack that is easy to portion and nicer on blood sugar than candy.",
      goals: "A good sweet fix and a handy pre workout snack. Watch the dried raisins, which are far more concentrated.",
      servings: "One cup is a normal portion.",
      swaps: ["Fresh grapes over dried raisins", "Freeze them for an ice-candy feel", "Pair with cheese or nuts"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Grapes are grown worldwide, from Mediterranean vineyards to Nigerian market bunches, and are central to wine culture.",
      combinations: ["Grapes with cheese", "Grapes with nuts", "Grapes in a fruit salad"],
      simple: "Grapes are natural sugar and antioxidants. A cup is a sweet snack that is not candy."
    },
    "broccoli": {
      kcal: 55, carbs: 11, protein: 3.7, fat: 0.6, fiber: 5.1, verdict: "good", emoji: "🥦",
      aliases: ["Broccoli florets", "Green broccoli", "Calabrese", "Cruciferous vegetable"],
      portion: "One cup chopped",
      ingredients: ["Broccoli", "Sometimes oil and garlic"],
      what: "Broccoli is a green cruciferous vegetable with tight florets, eaten steamed, roasted or stir fried.",
      contributions: [
        "Fibre, which fills you and feeds your gut.",
        "Vitamin C and vitamin K, both in useful amounts.",
        "Folate and antioxidants."
      ],
      benefits: "One of the most nutritious vegetables there is. Low in calories, high in fibre and packed with vitamins.",
      goals: "Excellent for fat loss because it adds real volume for very few calories. Add it to any plate to make it better.",
      servings: "One or two cups is a normal portion.",
      swaps: ["Steam or roast instead of frying", "Add garlic and a little olive oil", "Mix with other vegetables"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Broccoli is eaten across the world, from Chinese stir fried greens to roasted florets in the West.",
      combinations: ["Broccoli with grilled chicken", "Broccoli with rice and fish", "Broccoli in a stir fry"],
      simple: "Broccoli is a nutrition powerhouse. Add it to anything and the meal gets better."
    },
    "spinach": {
      kcal: 23, carbs: 3.6, protein: 2.9, fat: 0.4, fiber: 2.2, verdict: "good", emoji: "🥬",
      aliases: ["Green spinach", "Leafy greens", "Palak", "Efo riro"],
      portion: "One cup raw",
      ingredients: ["Spinach"],
      what: "Spinach is a soft, dark green leafy vegetable eaten raw in salads or cooked into soups and stews.",
      contributions: [
        "Iron, which carries oxygen in your blood and matters for energy.",
        "Vitamin K and vitamin A.",
        "Folate and a little plant protein."
      ],
      benefits: "Extremely low in calories and dense in nutrients. It is an easy way to make any meal more nutritious.",
      goals: "Superb for fat loss. Wilt it into sauces, eggs and stews so you barely notice you are eating more greens.",
      servings: "One or two cups raw, or a handful cooked, is a normal portion.",
      swaps: ["Wilt it into sauces and eggs", "Add to a smoothie", "Pair with vitamin C to help absorb the iron"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Spinach is eaten worldwide, from Nigerian efo riro to Indian palak paneer and Mediterranean salads.",
      combinations: ["Spinach in an omelette", "Spinach with beans and stew", "Spinach in a smoothie with fruit"],
      simple: "Spinach is free nutrition. Wilt it into anything and the meal quietly gets healthier."
    },
    "carrot": {
      kcal: 41, carbs: 10, protein: 0.9, fat: 0.2, fiber: 2.8, verdict: "good", emoji: "🥕",
      aliases: ["Carrots", "Sweet carrot", "Boiled carrot", "Carrot stick"],
      portion: "One cup chopped",
      ingredients: ["Carrot"],
      what: "Carrot is a sweet, crunchy root vegetable, eaten raw, boiled, roasted or juiced.",
      contributions: [
        "Beta-carotene, which your body turns into vitamin A for your eyes.",
        "Fibre, which helps with fullness.",
        "Natural sweetness with very few calories."
      ],
      benefits: "Sweet, crunchy and genuinely useful. A good low calorie snack that also gives your eyes what they need.",
      goals: "Great for fat loss as a snack or a cooked side. Keep it simple and skip the butter.",
      servings: "One or two cups is a normal portion.",
      swaps: ["Eat raw sticks as a snack", "Roast with a little oil", "Add to soups and stews"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Carrots are eaten everywhere, from raw sticks in lunchboxes to Nigerian carrot salad and Moroccan tagine.",
      combinations: ["Carrot sticks with hummus", "Carrot in a vegetable soup", "Carrot roasted with chicken"],
      simple: "Carrot is sweet, crunchy and low calorie. It is a snack that also looks after your eyes."
    },
    "soft drink": {
      kcal: 150, carbs: 39, protein: 0, fat: 0, fiber: 0, verdict: "off", emoji: "🥤",
      aliases: ["Soda", "Coke", "Fizzy drink", "Pop", "Carbonated drink", "Energy drink"],
      portion: "One can (330ml)",
      ingredients: ["Carbonated water", "Sugar", "Colour", "Flavour", "Caffeine in some"],
      what: "A soft drink is a fizzy, sweetened beverage with sugar and no real nutrition.",
      contributions: [
        "A lot of sugar, which adds calories without filling you up.",
        "No protein, fat, fibre, vitamins or minerals.",
        "Caffeine in energy drinks and colas."
      ],
      benefits: "There is little nutritional benefit. They taste good and can be a quick energy hit, but they are empty calories.",
      goals: "The easiest thing to cut for fat loss. Switching one a day to water makes a real difference over weeks.",
      servings: "Zero is the best serving. One can occasionally is fine.",
      swaps: ["Water or sparkling water with lime", "Unsweetened tea or coffee", "Diluted fruit juice"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Soft drinks are global, from Nigerian bottled drinks to American soda and Mexican cola made with real sugar.",
      combinations: ["Better replaced with water", "Sparkling water with a squeeze of citrus", "A sugar free option if you need the fizz"],
      simple: "Soft drink is sugar water. Swap it for water and your body notices within days."
    },
    "fruit juice": {
      kcal: 112, carbs: 28, protein: 0.5, fat: 0.3, fiber: 0.2, verdict: "watch", emoji: "🧃",
      aliases: ["Juice", "Orange juice", "Zobo", "Chapman", "Smoothie juice", "Fresh juice"],
      portion: "One glass (250ml)",
      ingredients: ["Fruit", "Sometimes added sugar", "Water"],
      what: "Fruit juice is fruit with the fibre mostly removed and the sugar left behind, sometimes with sugar added.",
      contributions: [
        "Natural sugar, which hits your bloodstream faster without the fibre.",
        "Some vitamin C.",
        "Very little fibre, which is what makes whole fruit better."
      ],
      benefits: "A handy source of some vitamins, but whole fruit is almost always the better choice because of the fibre.",
      goals: "Not ideal for fat loss, because you can drink a lot of sugar quickly. Choose whole fruit or a very small glass.",
      servings: "One small glass at most. Whole fruit is better.",
      swaps: ["Eat the whole fruit instead", "Choose no added sugar varieties", "Dilute with water"],
      allergens: ["Gluten free", "Dairy free", "No common allergens"],
      culture: "Juices are drunk worldwide, from Nigerian zobo and chapman to fresh orange juice and tropical blends.",
      combinations: ["Better replaced by whole fruit", "A small glass with a meal", "Diluted with sparkling water"],
      simple: "Juice is fruit with the fibre taken out. Eat the whole fruit and you get more from it."
    },
    "chocolate": {
      kcal: 235, carbs: 26, protein: 3, fat: 14, fiber: 2, verdict: "off", emoji: "🍫",
      aliases: ["Milk chocolate", "Dark chocolate", "Chocolate bar", "Candy bar", "Sweet"],
      portion: "One small bar (about 45g)",
      ingredients: ["Cocoa", "Sugar", "Milk solids", "Cocoa butter", "Vanilla"],
      what: "Chocolate is a sweet food made from cocoa, sugar and milk, eaten as a bar or a treat.",
      contributions: [
        "Sugar, which is quick energy but easy to overdo.",
        "Fat, which makes it calorie dense.",
        "A little iron and antioxidants, more in dark chocolate."
      ],
      benefits: "It is a treat, not a health food. A little dark chocolate is fine and can even be a source of antioxidants.",
      goals: "Enjoy a small piece rather than a whole bar. Dark chocolate with a high cocoa count is the smarter choice.",
      servings: "One or two small squares is a portion.",
      swaps: ["Dark chocolate with 70% cocoa or more", "A smaller bar", "Fruit and nuts when you want something sweet"],
      allergens: ["Dairy", "Soy", "May contain nuts", "Gluten in some"],
      culture: "Chocolate is loved worldwide, from Swiss and Belgian bars to West African cocoa, where much of it is grown.",
      combinations: ["A square of dark chocolate after a meal", "Chocolate with a coffee", "Chocolate as an occasional treat"],
      simple: "Chocolate is a treat, and that is fine. Choose dark, and keep it to a square or two."
    },
    "ice cream": {
      kcal: 207, carbs: 24, protein: 3.5, fat: 11, fiber: 0.7, verdict: "off", emoji: "🍨",
      aliases: ["Cream ice", "Gelato", "Frozen dessert", "Sherbet", "Ice cream cone"],
      portion: "One scoop (about 66g)",
      ingredients: ["Milk", "Cream", "Sugar", "Flavour"],
      what: "Ice cream is a frozen dessert made from milk, cream and sugar, churned while freezing.",
      contributions: [
        "Sugar and fat, which make it very calorie dense.",
        "A little protein from the milk.",
        "Calcium, though you pay for it in sugar and fat."
      ],
      benefits: "It is a dessert, and a lovely one. There is little nutritional benefit, but a bowl now and then does no harm.",
      goals: "Keep it occasional. A single scoop rather than a large bowl, and consider fruit as a cooler treat.",
      servings: "One scoop is a portion.",
      swaps: ["Frozen banana blended for a healthier option", "Frozen yoghurt with berries", "A smaller scoop"],
      allergens: ["Dairy", "Lactose", "Egg in some", "Nuts in some flavours"],
      culture: "Ice cream is a global dessert, from Italian gelato to Nigerian ice cream and American sundae culture.",
      combinations: ["A scoop as an occasional treat", "With a piece of fruit", "As a small reward after a big effort"],
      simple: "Ice cream is a dessert. Have a scoop, enjoy it, and do not make it a daily habit."
    },
    "chips": {
      kcal: 312, carbs: 41, protein: 3.4, fat: 15, fiber: 3.8, verdict: "off", emoji: "🍟",
      aliases: ["French fries", "Fried chips", "Potato chips", "Crisps", "Roasted plantain chips"],
      portion: "One medium serving",
      ingredients: ["Potato", "Oil", "Salt"],
      what: "Chips are potatoes cut into strips and fried in oil, or thinly sliced and fried crisp as crisps.",
      contributions: [
        "Carbohydrate from the potato.",
        "A lot of fat from the frying oil.",
        "Salt, which can be high."
      ],
      benefits: "Tasty and filling, but the frying adds a lot of calories. They are best as an occasional side, not a daily food.",
      goals: "Not ideal for fat loss. Choose baked or air fried, and keep the portion small.",
      servings: "A small handful or one small portion.",
      swaps: ["Bake or air fry instead of deep frying", "A smaller portion", "Swap for a boiled or roasted potato"],
      allergens: ["Gluten free", "Dairy free", "Often cooked in shared oil"],
      culture: "Chips are eaten everywhere, from British chip shops to American fries and Nigerian roasted plantain chips.",
      combinations: ["Chips with a burger occasionally", "A small side with a grilled meal", "Baked chips as a better option"],
      simple: "Chips are fried and salty. Enjoy them occasionally, and choose baked when you can."
    },
    "meat pie": {
      kcal: 320, carbs: 32, protein: 9, fat: 17, fiber: 1.5, verdict: "off", emoji: "🥟",
      aliases: ["Pie", "Chicken pie", "Beef pie", "Sausage roll", "Patty"],
      portion: "One pie",
      ingredients: ["Flour pastry", "Meat", "Potato", "Oil", "Seasoning"],
      what: "A meat pie is a pastry case filled with seasoned minced meat and potato, baked until golden.",
      contributions: [
        "Carbohydrate from the pastry.",
        "Some protein from the meat.",
        "A lot of fat, from both the pastry and the filling."
      ],
      benefits: "Convenient and filling, but the pastry makes it high in fat and calories for what it is.",
      goals: "An occasional treat rather than a meal. If you have one, keep the rest of the day light and add a salad.",
      servings: "One pie is a portion.",
      swaps: ["A smaller pie", "A salad or fruit on the side", "Homemade with less oil and more filling"],
      allergens: ["Gluten", "Wheat", "Egg", "May contain milk"],
      culture: "Meat pies are popular street food, from Nigerian meat pie to British pork pie and Jamaican patty.",
      combinations: ["A pie as an occasional snack", "With a side salad", "With a piece of fruit"],
      simple: "A meat pie is a tasty but fatty snack. Keep it occasional and add something fresh beside it."
    },
    "shawarma": {
      kcal: 450, carbs: 45, protein: 25, fat: 19, fiber: 3, verdict: "watch", emoji: "🥙",
      aliases: ["Shawarma", "Kebab", "Doner", "Gyro", "Chicken shawarma", "Beef shawarma"],
      portion: "One wrap",
      ingredients: ["Flatbread", "Grilled meat", "Vegetables", "Garlic sauce", "Sometimes fries"],
      what: "Shawarma is spiced meat shaved off a vertical roast and wrapped in flatbread with salad and sauce.",
      contributions: [
        "Good protein from the meat.",
        "Carbohydrate from the bread.",
        "Fat from the meat and especially the sauce."
      ],
      benefits: "A filling, high protein meal that is easy to find on the move. The sauce and any fries are what push the calories up.",
      goals: "A reasonable choice if you ask for more salad and less sauce, and skip the fries inside the wrap.",
      servings: "One wrap is a full meal.",
      swaps: ["Ask for extra salad and less sauce", "Skip the fries inside", "Choose chicken over fatty red meat"],
      allergens: ["Gluten", "Wheat", "Dairy in some sauces", "Sesame"],
      culture: "Shawarma is a Middle Eastern staple now loved worldwide, from Lagos shawarma stands to Greek gyros and Turkish doner.",
      combinations: ["Shawarma with a salad", "Shawarma with a yoghurt drink", "Shawarma as a post training meal"],
      simple: "Shawarma is solid protein and carbs. Ask for more salad, less sauce, and skip the fries inside."
    },
    "fried chicken": {
      kcal: 490, carbs: 18, protein: 31, fat: 31, fiber: 1, verdict: "off", emoji: "🍗",
      aliases: ["Chicken", "Crispy chicken", "Jerk chicken", "Fried poultry", "Chicken drumstick"],
      portion: "Two pieces",
      ingredients: ["Chicken", "Flour coating", "Oil", "Spices"],
      what: "Fried chicken is chicken coated in seasoned flour and deep fried until crisp.",
      contributions: [
        "Good protein from the chicken.",
        "A lot of fat absorbed from the frying oil.",
        "Carbohydrate from the flour coating."
      ],
      benefits: "High in protein, but the deep frying makes it very calorie dense. Grilled chicken gets you the protein without the fat.",
      goals: "Not ideal for fat loss. Choose grilled or roasted chicken, and if you fry it, keep it to one piece with a salad.",
      servings: "One or two pieces is a portion.",
      swaps: ["Grilled or baked chicken instead", "Remove the skin", "Add a large salad on the side"],
      allergens: ["Gluten", "Wheat", "Egg in some batters", "Dairy in some"],
      culture: "Fried chicken is loved worldwide, from American fried chicken to Nigerian fried chicken and Jamaican jerk.",
      combinations: ["Grilled chicken with rice and salad", "Chicken with vegetables", "Chicken in a wrap"],
      simple: "Fried chicken is protein drowned in fat. Grill it instead and keep the protein, lose the oil."
    },
    "groundnut": {
      kcal: 161, carbs: 4.6, protein: 7.3, fat: 14, fiber: 2.4, verdict: "watch", emoji: "🥜",
      aliases: ["Peanuts", "Ground nuts", "Kuli kuli", "Peanut butter", "Roasted groundnut"],
      portion: "One handful (about 28g)",
      ingredients: ["Groundnuts", "Sometimes salt or oil"],
      what: "Groundnuts, or peanuts, are legumes eaten roasted, boiled, or ground into butter.",
      contributions: [
        "Plant protein, which supports muscle.",
        "Healthy fats, which keep you full.",
        "Fibre and a range of minerals."
      ],
      benefits: "A cheap, filling, high protein snack. Natural peanut butter with no added sugar or oil is the best form.",
      goals: "Good for muscle building and satiety. Because they are calorie dense, stick to a small handful.",
      servings: "One small handful or one tablespoon of butter.",
      swaps: ["Unsalted roasted groundnuts", "Natural peanut butter with no added sugar", "A small portion with fruit"],
      allergens: ["Peanut, a serious and common allergen", "Sometimes processed with tree nuts", "Check for added sugar"],
      culture: "Groundnuts are a West African staple, from roasted groundnut to kuli kuli and groundnut soup.",
      combinations: ["Groundnuts with banana", "Peanut butter on wholegrain bread", "Groundnut in a soup or stew"],
      simple: "Groundnut is protein and healthy fat. It is filling, but keep it to a small handful."
    },
    "tea": {
      kcal: 2, carbs: 0.3, protein: 0, fat: 0, fiber: 0, verdict: "good", emoji: "🍵",
      aliases: ["Green tea", "Black tea", "Herbal tea", "Chai", "Zobo tea", "Mint tea"],
      portion: "One cup",
      ingredients: ["Tea leaves", "Hot water", "Optional milk or sugar"],
      what: "Tea is a drink made by steeping leaves in hot water, drunk plain or with milk and sweetener.",
      contributions: [
        "Almost no calories when drunk plain.",
        "Antioxidants called catechins, more in green tea.",
        "A little caffeine, which can help focus and training."
      ],
      benefits: "A comforting, near-zero calorie drink that can support hydration and give a gentle lift.",
      goals: "An excellent drink for fat loss because it is essentially free. Go easy on sugar and full-fat milk.",
      servings: "Several cups a day is fine.",
      swaps: ["Drink it without sugar", "Use a splash of milk", "Try herbal or green tea"],
      allergens: ["Gluten free", "Dairy free unless milk is added", "No common allergens"],
      culture: "Tea is one of the most drunk drinks on earth, from Nigerian zobo to British builder's tea, Indian chai and Moroccan mint tea.",
      combinations: ["Tea without sugar as an everyday drink", "Green tea before a workout", "Herbal tea in the evening"],
      simple: "Tea is a near-free calorie comfort. Take it without sugar and drink it freely."
    },
    "coffee": {
      kcal: 5, carbs: 0, protein: 0.3, fat: 0, fiber: 0, verdict: "good", emoji: "☕",
      aliases: ["Black coffee", "Espresso", "Cappuccino", "Latte", "Café", "Instant coffee"],
      portion: "One cup",
      ingredients: ["Coffee beans", "Hot water", "Optional milk and sugar"],
      what: "Coffee is a drink brewed from roasted coffee beans, drunk black or with milk.",
      contributions: [
        "Almost no calories when black.",
        "Caffeine, which boosts focus and can improve training performance.",
        "Antioxidants."
      ],
      benefits: "A useful, low calorie lift. Black coffee is one of the best drinks for fat loss, and caffeine can genuinely help a workout.",
      goals: "Great before training for the performance boost. Avoid loading it with sugar and cream.",
      servings: "One to three cups a day is fine for most people.",
      swaps: ["Drink it black", "Use a splash of milk instead of cream", "Skip the sugar"],
      allergens: ["Gluten free", "Dairy free unless milk is added", "No common allergens"],
      culture: "Coffee is global, from Nigerian coffee to Italian espresso, Ethiopian ceremony and American latte culture.",
      combinations: ["Black coffee before a workout", "Coffee as an afternoon focus lift", "Coffee with a small snack"],
      simple: "Black coffee is a free calorie, focus boosting lift. Take it before training and go easy on the sugar."
    }
  };

  /* ---------------- feature names ----------------
     Clear, familiar fitness wording instead of abstract names. */
  var FEATURES = {
    profile:  { name: "My Profile",   tagline: "Your goals, your body, your badge" },
    plan:     { name: "My Routine",   tagline: "Your week, written out" },
    library:  { name: "The Guides",   tagline: "Every movement, explained" },
    tracker:  { name: "My Workout Log", tagline: "Log it, then beat it" },
    equipment: { name: "Gym Equipment", tagline: "Know before you queue" },
    nutrition: { name: "My Plate Truth", tagline: "Food explained, plainly" },
    projection: { name: "Body Goals",  tagline: "Meet the body you're building" },
    find:     { name: "Find a Gym",   tagline: "The gym that's yours" },
    trainer:  { name: "My Trainer",   tagline: "Coach, matched to your goal" }
  };

  /* Map a vision-model item from /api/food-scan into the same shape the food
     guide renders, so a scanned (unknown-to-us) food gets the full guide too. */
  function visionToFood(item) {
    var n = item.nutrition || {};
    function num(v) { v = parseFloat(v); return isFinite(v) ? Math.round(v) : 0; }
    var verdict = item.verdict;
    if (verdict !== "good" && verdict !== "watch" && verdict !== "off") verdict = "watch";
    return {
      name: item.name || "Scanned food",
      kcal: num(n.kcal), carbs: num(n.carbs), protein: num(n.protein),
      fat: num(n.fat), fiber: num(n.fiber),
      verdict: verdict,
      aliases: item.aliases || [],
      category: item.category || "",
      confidence: (typeof item.confidence === "number") ? item.confidence : null,
      portion: item.servings || "",
      ingredients: item.ingredients || [],
      what: item.what || "",
      contributions: item.gives || [],
      benefits: item.benefits || "",
      goals: item.goalFit || "",
      servings: item.servings || "",
      swaps: item.swaps || [],
      allergens: item.allergens || [],
      culture: item.culture || "",
      combinations: item.combinations || [],
      simple: item.benefits || item.what || "",
      fromVision: true
    };
  }

  global.GBData = {
    exercises: EXERCISES,
    equipment: EQUIPMENT,
    statusMeta: STATUS_META,
    foods: FOODS,
    visionToFood: visionToFood,
    features: FEATURES,
    goals: ["Lose weight", "Build muscle", "Get toned", "Improve endurance", "General fitness", "Strength & power"],
    archetypes: [
      { id: "lean",   icon: "🏃", name: "Lean & Toned",  desc: "Low fat, defined" },
      { id: "muscle", icon: "💪", name: "Muscular",      desc: "Size & mass" },
      { id: "athletic", icon: "⚡", name: "Athletic",    desc: "Power & speed" },
      { id: "curves", icon: "🍑", name: "Curves",        desc: "Glutes & waist" },
      { id: "slim",   icon: "🌿", name: "Slim & Strong", desc: "Petite, strong" },
      { id: "bulk",   icon: "🏋️", name: "Bulk & Power",  desc: "Thick & strong" }
    ],
    gyms: [
      { id: "g1", name: "Iron House Gym",  dist: 0.4, open: true,  x: 28, y: 34, photo: "gym/g1.jpg", tags: ["Cardio", "Weights", "24/7"] },
      { id: "g2", name: "FitZone Central", dist: 1.1, open: true,  x: 62, y: 26, photo: "gym/g2.jpg", tags: ["Classes", "Pool"] },
      { id: "g3", name: "PowerHouse Fitness", dist: 1.8, open: false, x: 44, y: 66, photo: "gym/g3.jpg", tags: ["Weights", "Sauna"] },
      { id: "g4", name: "Pulse Studio",    dist: 2.3, open: true,  x: 76, y: 58, photo: "gym/g4.jpg", tags: ["HIIT", "Yoga"] },
      { id: "g5", name: "Iron House Branch 2", dist: 0.9, open: true, x: 38, y: 50, photo: "gym/g5.jpg", tags: ["Member gym"] }
    ]
  };
})(typeof window !== "undefined" ? window : this);
