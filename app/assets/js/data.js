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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: ["ex/dumbbell-row.jpg"]
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
      gallery: ["ex/goblet-squat.jpg"]
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
      gallery: ["ex/bench-dips.jpg"]
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
      gallery: ["ex/leg-curl.jpg"]
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
      gallery: ["ex/calisthenics.jpg"]
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
      gallery: ["ex/incline-press.jpg"]
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      gallery: ["ex/cardio.jpg"]
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
      gallery: ["ex/lat-pulldown.jpg"]
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
      gallery: ["ex/legs.jpg"]
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
      gallery: []
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
      gallery: []
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
      gallery: []
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
      photo: "meal/meal-1.jpg", portion: "1 bowl, about 250 g",
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
      photo: "meal/meal-2.jpg", portion: "1 breast, about 150 g",
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
      photo: "meal/meal-3.jpg", portion: "1 cup, about 200 g cooked",
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
      photo: "meal/meal-1.jpg", portion: "1 medium, about 120 g",
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
      photo: "meal/meal-3.jpg", portion: "1 slice, about 107 g",
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
      photo: "meal/meal-2.jpg", portion: "1 burger, about 220 g",
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
      photo: "meal/meal-1.jpg", portion: "1 large bowl, about 200 g",
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
      photo: "meal/meal-3.jpg", portion: "5 skewers, about 150 g",
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
      photo: "meal/meal-1.jpg", portion: "1 piece, about 150 g",
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
      photo: "meal/meal-2.jpg", portion: "1 large egg, about 50 g",
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
      photo: "meal/meal-1.jpg", portion: "1 cup cooked, about 160 g",
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

  global.GBData = {
    exercises: EXERCISES,
    equipment: EQUIPMENT,
    statusMeta: STATUS_META,
    foods: FOODS,
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
      { id: "g1", name: "Iron House Gym",  dist: 0.4, open: true,  x: 28, y: 34, tags: ["Cardio", "Weights", "24/7"] },
      { id: "g2", name: "FitZone Central", dist: 1.1, open: true,  x: 62, y: 26, tags: ["Classes", "Pool"] },
      { id: "g3", name: "PowerHouse Fitness", dist: 1.8, open: false, x: 44, y: 66, tags: ["Weights", "Sauna"] },
      { id: "g4", name: "Pulse Studio",    dist: 2.3, open: true,  x: 76, y: 58, tags: ["HIIT", "Yoga"] },
      { id: "g5", name: "Iron House Branch 2", dist: 0.9, open: true, x: 38, y: 50, tags: ["Member gym"] }
    ]
  };
})(typeof window !== "undefined" ? window : this);
