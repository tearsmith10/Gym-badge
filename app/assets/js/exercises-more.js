/* ==========================================================================
   GYM BADGE — the rest of the exercise library

   More movements, written the same way as the first set: what the movement
   is for, which muscles it works, what you need, how to start, step by step,
   sets and rest, breathing, the mistakes people actually make, safety notes
   and easier versions.

   Photographs are only used where the photo really shows that movement. A
   movement without a photograph says so rather than borrowing a picture of
   something else.
   ========================================================================== */
(function (global) {
  "use strict";

  var MORE = [
    /* ---------------- upper body ---------------- */
    {
      id: "wallpushup", name: "Wall Push Ups", unit: "reps", type: "count",
      category: "Upper body", difficulty: "Beginner",
      muscles: ["Chest", "Front of shoulders", "Triceps", "Core"],
      equipment: ["A wall"],
      purpose: "Wall push ups are the easiest way to learn the push up movement. They build the pushing strength and the shoulder control you need before you can hold your own body weight.",
      start: "Stand facing a wall with your hands on it at chest height, a little wider than your shoulders. Step your feet back so your body is at a slight angle, and keep your hands and arms still.",
      steps: [
        "Squeeze your stomach so your body forms one straight line from head to heels.",
        "Bend your elbows to about 45 degrees and lean your chest towards the wall.",
        "Stop when your chest is close to the wall, with your elbows tucked in.",
        "Push the wall away and return to the start position.",
        "Repeat slowly, and step your feet further back as the movement gets easier."
      ],
      sets: "3 sets of 12 to 20 reps", reps: "12 to 20 reps", rest: "45 to 60 seconds",
      breathing: "Breathe in as you lean towards the wall and breathe out as you push away.",
      mistakes: [
        "Letting your hips drop towards the wall, which takes the work out of your chest.",
        "Holding the position at the bottom instead of pushing back.",
        "Moving your hands up and down between reps, which changes the exercise."
      ],
      safety: [
        "Stop if you feel sharp pain in your shoulders or wrists.",
        "If your wrists complain, use fists or a rolled towel instead of flat palms."
      ],
      easier: [
        "Stand closer to the wall so the angle is smaller.",
        "Do the movement on a very slow count — two seconds down, two seconds up."
      ],
      gallery: []
    },
    {
      id: "dumbbellpress", name: "Dumbbell Press", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Intermediate",
      muscles: ["Chest", "Front of shoulders", "Triceps"],
      equipment: ["A pair of dumbbells", "A bench or a sturdy chair"],
      purpose: "The dumbbell press builds pressing strength in the chest and shoulders while letting each arm work on its own, which helps you spot and fix a weaker side.",
      start: "Sit on a bench and hold a dumbbell in each hand beside your thighs. Lean back slightly, keep your feet flat on the floor, and bring the weights up to shoulder height with your palms facing forward.",
      steps: [
        "Squeeze your shoulder blades together and keep them pinned down.",
        "Press both dumbbells up and slightly together until your arms are straight.",
        "Pause for a moment at the top without locking your elbows.",
        "Lower the weights back down slowly, until your elbows are just below shoulder height.",
        "Repeat, keeping the movement smooth rather than fast."
      ],
      sets: "3 to 4 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "90 to 120 seconds",
      breathing: "Breathe in as you lower the weights and breathe out as you press them up.",
      mistakes: [
        "Letting your lower back arch off the bench, which puts the load on your spine.",
        "Bouncing the weights off your chest instead of controlling them.",
        "Pressing unevenly, with one side higher than the other.",
        "Going so heavy that you cannot control the lowering phase."
      ],
      safety: [
        "Stop if you feel sharp pain in your shoulder or chest.",
        "Do not drop the dumbbells behind you — set your feet down first if you need to put them away.",
        "If you are new to pressing, start with light weights and perfect technique."
      ],
      easier: [
        "Press each dumbbell one arm at a time, sitting upright.",
        "Do the press standing, with no bench at all.",
        "Halve the weight and double the reps."
      ],
      gallery: []
    },
    {
      id: "bentoverrow", name: "Bent Over Row", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Intermediate",
      muscles: ["Upper back", "Lats", "Biceps", "Rear shoulders"],
      equipment: ["A pair of dumbbells", "A bench or a chair"],
      purpose: "The bent over row pulls the upper back and the lats, which is what keeps your shoulders healthy and your posture upright when you push and squat.",
      start: "Stand with a dumbbell in each hand. Bend your knees a little, hinge forward at the hips until your torso is about 45 degrees to the floor, and let your arms hang straight down under your shoulders.",
      steps: [
        "Brace your stomach and keep your back flat, with your neck in line with your spine.",
        "Pull both dumbbells up towards your ribs, leading with your elbows.",
        "Squeeze your shoulder blades together at the top and hold for a moment.",
        "Lower the weights slowly back down until your arms are straight.",
        "Repeat without swinging your body to lift the weight."
      ],
      sets: "3 sets of 10 to 12 reps", reps: "10 to 12 reps", rest: "90 seconds",
      breathing: "Breathe out as you pull the weights up and breathe in as you lower them.",
      mistakes: [
        "Rounding your back, which puts the load on your lower back.",
        "Swinging the weight up with your body instead of pulling with your arms.",
        "Pulling the weights towards your chin instead of towards your ribs."
      ],
      safety: [
        "Stop if you feel a sharp pull in your lower back.",
        "Keep the weight close to your body the whole time.",
        "If your lower back tires first, use a chest-supported row or reduce the weight."
      ],
      easier: [
        "Sit down, lean forward with a hand on each knee, and row from there.",
        "Use a light weight and focus on squeezing your shoulder blades together.",
        "Do one arm at a time with your hand braced on the bench."
      ],
      gallery: []
    },
    {
      id: "renegaderow", name: "Renegade Row", unit: "kg", type: "weight",
      category: "Upper body", difficulty: "Advanced",
      muscles: ["Upper back", "Lats", "Core", "Shoulders"],
      equipment: ["A pair of dumbbells", "A mat"],
      purpose: "The renegade row trains your back and your core at the same time, because your body has to stay steady while your arms pull.",
      start: "Start in a push up position with a dumbbell in each hand, your hands directly under your shoulders and your feet a little wider than your hips.",
      steps: [
        "Squeeze your stomach and squeeze your glutes so your body forms one straight line.",
        "Lift one dumbbell by bending that elbow towards your ribs, keeping your hips level.",
        "Lower the dumbbell back down under your shoulder with control.",
        "Lift the other side the same way.",
        "Keep alternating, and if your hips start to rock, use a smaller weight."
      ],
      sets: "3 sets of 6 to 10 reps per side", reps: "6 to 10 reps per side", rest: "90 seconds",
      breathing: "Breathe out as you lift the weight and breathe in as you lower it.",
      mistakes: [
        "Twisting your hips as you row, which means your core has stopped working.",
        "Rowing too fast and losing control at the bottom.",
        "Letting your head drop between your arms."
      ],
      safety: [
        "Stop if your lower back starts to ache.",
        "Start with very light weights, or row from your knees.",
        "Make sure the floor is not slippery before you begin."
      ],
      easier: [
        "Drop to your knees and row from there.",
        "Hold your weight with one hand and row, using the other hand on the floor for support.",
        "Do a plank with your hands on a bench and only hold the position."
      ],
      gallery: ["ex/full-body.jpg"]
    },
    {
      id: "chinup", name: "Chin Ups", unit: "reps", type: "count",
      category: "Upper body", difficulty: "Intermediate",
      muscles: ["Biceps", "Upper back", "Lats"],
      equipment: ["A pull up bar"],
      purpose: "Chin ups pull with the palms facing you, which loads the arms and the upper back differently from a pull up and gives your elbows a straighter path.",
      start: "Hold a pull up bar with your palms facing you and your hands a little wider than shoulder width. Hang from the bar with your arms straight and your feet off the floor.",
      steps: [
        "Pull your shoulder blades down and away, so you start by engaging your back.",
        "Bend your elbows and pull your chin up towards the bar.",
        "Keep your elbows close to your body the whole way up.",
        "Lower yourself slowly until your arms are straight again.",
        "Avoid swinging or kicking your legs."
      ],
      sets: "3 sets of 5 to 10 reps", reps: "5 to 10 reps", rest: "2 minutes",
      breathing: "Breathe out as you pull up and breathe in as you lower yourself.",
      mistakes: [
        "Swinging your body to get the extra height.",
        "Dropping below the bar too fast and hitting your elbows.",
        "Pulling up with your arms alone and letting your back arch."
      ],
      safety: [
        "Stop if you feel sharp pain in your shoulders or elbows.",
        "Make sure the bar is fixed properly before you start.",
        "Use a band or a machine if you cannot yet pull yourself all the way up."
      ],
      easier: [
        "Band assisted chin ups — loop a resistance band over the bar and pull through it.",
        "Negative chin ups — jump up and lower yourself as slowly as you can.",
        "Chin ups on an angled bar or a low bar, with your feet on the floor."
      ],
      gallery: []
    },
    /* ---------------- shoulders ---------------- */
    {
      id: "lateralraise", name: "Dumbbell Lateral Raise", unit: "kg", type: "weight",
      category: "Shoulders", difficulty: "Beginner",
      muscles: ["Side of shoulders", "Upper traps"],
      equipment: ["A pair of dumbbells"],
      purpose: "Lateral raises work the side of the shoulder, the part that gives shoulders their shape and that almost no other movement touches.",
      start: "Stand tall with a light dumbbell in each hand, resting beside your thighs, with a small bend in your elbows and your palms facing inwards.",
      steps: [
        "Keep your shoulders down and away from your ears.",
        "Lift both arms out to the sides until your hands are roughly shoulder height.",
        "Stop there — going higher starts working the traps instead of the shoulder.",
        "Lower the weights slowly back down to your sides.",
        "Keep your wrists straight and your elbows soft."
      ],
      sets: "3 sets of 12 to 15 reps", reps: "12 to 15 reps", rest: "60 seconds",
      breathing: "Breathe out as you lift and breathe in as you lower.",
      mistakes: [
        "Shrugging your shoulders up towards your ears.",
        "Swinging the weight and using your body to lift it.",
        "Going too heavy, so the last reps turn into a shrug."
      ],
      safety: [
        "Stop if you feel a pinch in the top of your shoulder.",
        "Use a very light weight — this movement is about control, not load.",
        "Do not swing the weight up to shoulder height."
      ],
      easier: [
        "Use a resistance band instead of dumbbells.",
        "Do one arm at a time with your other hand on your thigh.",
        "Lower the height of the raise to halfway."
      ],
      gallery: []
    },
    {
      id: "facepull", name: "Face Pull", unit: "kg", type: "weight",
      category: "Shoulders", difficulty: "Beginner",
      muscles: ["Rear shoulders", "Upper back", "Rotator cuff"],
      equipment: ["A rope or a band", "A cable machine"],
      purpose: "The face pull works the rear of the shoulder and the upper back, which counteracts all the pressing and reaching you do through the day. It is one of the best habits for healthy shoulders.",
      start: "Stand facing a cable machine with a rope attachment at upper chest height, or hold a resistance band at the same height with both hands.",
      steps: [
        "Stand tall with the rope or band at chest height and your hands wider than your shoulders.",
        "Pull the rope or band towards your face, leading with your elbows.",
        "At the end, your knuckles should be beside your ears and your elbows level with your shoulders.",
        "Squeeze your shoulder blades together and hold for a moment.",
        "Return slowly to the start position."
      ],
      sets: "3 sets of 12 to 15 reps", reps: "12 to 15 reps", rest: "60 seconds",
      breathing: "Breathe out as you pull and breathe in as you return.",
      mistakes: [
        "Pulling with your hands instead of your elbows.",
        "Shrugging your shoulders towards your ears.",
        "Going so fast that the movement is over before you feel your back working."
      ],
      safety: [
        "Stop if you feel sharp pain in the shoulder joint.",
        "Keep the movement gentle — you should feel the upper back, not the trap.",
        "Use the lightest weight that lets you keep good form."
      ],
      easier: [
        "Use a resistance band anchored low and step back until there is tension.",
        "Do the movement with no equipment at all — pull your elbows back and squeeze your shoulder blades.",
        "Halve the reps and slow the movement down."
      ],
      gallery: []
    },
    /* ---------------- core ---------------- */
    {
      id: "sideplank", name: "Side Plank", unit: "sec", type: "time",
      category: "Core", difficulty: "Beginner",
      muscles: ["Side of the core", "Obliques", "Glutes", "Side of shoulders"],
      equipment: ["A mat"],
      purpose: "The side plank trains the sides of your core, which is what keeps your spine steady when you lift, and it also works the glute of the top leg.",
      start: "Lie on your side with your legs straight and stacked, and rest your elbow directly under your shoulder. Bring your feet together and your knees slightly bent if that helps your balance.",
      steps: [
        "Lift your hips up so your body forms a straight line from head to feet.",
        "Rest your top hand on your hip or on the floor in front of you for balance.",
        "Hold the position, breathing normally.",
        "Lower your hips down slowly to rest, then change sides.",
        "If your hips start to drop, stop the set there rather than pushing through it."
      ],
      sets: "3 sets of 20 to 40 seconds per side", reps: "Hold 20 to 40 seconds per side", rest: "45 seconds",
      breathing: "Keep breathing steadily throughout the hold. Holding your breath will make you shake.",
      mistakes: [
        "Letting your hips sag towards the floor.",
        "Rolling your body backwards so you are facing the ceiling.",
        "Holding your breath and running out of air before the set is over."
      ],
      safety: [
        "Stop if you feel sharp pain in your shoulder or lower back.",
        "Keep your neck in line with your spine — do not crane it upwards.",
        "Bend your knees if you are struggling to hold a straight line."
      ],
      easier: [
        "Kneel on your bottom knee and hold the position from there.",
        "Drop your bottom knee to the floor between holds and rest longer.",
        "Hold the position against a wall for support."
      ],
      gallery: []
    },
    {
      id: "deadbug", name: "Dead Bug", unit: "reps", type: "count",
      category: "Core", difficulty: "Beginner",
      muscles: ["Deep core", "Hip flexors", "Lower back"],
      equipment: ["A mat"],
      purpose: "The dead bug teaches your core to stay still while your limbs move, which is the safest way to build deep core strength and a strong lower back connection.",
      start: "Lie on your back with your arms straight up above your chest and your knees bent over your hips at 90 degrees.",
      steps: [
        "Press your lower back gently into the floor and hold it there.",
        "Slowly lower your right arm overhead and your left leg towards the floor at the same time.",
        "Stop before your lower back lifts off the floor.",
        "Return to the start and swap sides.",
        "Keep the movement slow and controlled the whole time."
      ],
      sets: "3 sets of 8 to 10 reps per side", reps: "8 to 10 reps per side", rest: "45 seconds",
      breathing: "Breathe out as you lower your arm and leg, and breathe in as you return.",
      mistakes: [
        "Letting your lower back arch off the floor as the limbs reach out.",
        "Moving too fast, which turns the exercise into a swing.",
        "Keeping your neck tense — rest your head on the floor if that helps."
      ],
      safety: [
        "Stop if you feel pain in your lower back.",
        "Reduce the range of the movement rather than losing your back position.",
        "If you are pregnant or have a recent abdominal operation, check with a professional first."
      ],
      easier: [
        "Move only one limb at a time.",
        "Keep your legs bent and only move your arms.",
        "Hold the starting position and practise keeping your back flat."
      ],
      gallery: []
    },
    {
      id: "birddog", name: "Bird Dog", unit: "reps", type: "count",
      category: "Core", difficulty: "Beginner",
      muscles: ["Deep core", "Glutes", "Upper back"],
      equipment: ["A mat"],
      purpose: "The bird dog trains your core to hold your body steady while your back and glute muscles work, and it is kind to a tired lower back.",
      start: "Start on all fours with your hands under your shoulders and your knees under your hips. Your back should be flat, not dipped.",
      steps: [
        "Squeeze your stomach so your lower back flattens slightly.",
        "Reach your right arm forward and your left leg back at the same time.",
        "Hold for two seconds without twisting your hips.",
        "Return to all fours and swap sides.",
        "Keep your hips level throughout."
      ],
      sets: "3 sets of 8 reps per side", reps: "8 reps per side", rest: "45 seconds",
      breathing: "Breathe out as you reach out and breathe in as you return.",
      mistakes: [
        "Twisting your hips so your body rotates instead of staying square.",
        "Lifting your leg higher than your arm, which turns it into a kick.",
        "Letting your lower back dip towards the floor."
      ],
      safety: [
        "Stop if you feel pain in your lower back or shoulder.",
        "Keep the reach low if your back starts to dip.",
        "Move slowly — this is not an exercise to rush."
      ],
      easier: [
        "Reach out with only the arm or only the leg.",
        "Keep the leg bent and lift the knee a few centimetres.",
        "Hold on to a wall with one hand if you need help with balance."
      ],
      gallery: []
    },
    {
      id: "lyinglegraise", name: "Lying Leg Raise", unit: "reps", type: "count",
      category: "Core", difficulty: "Intermediate",
      muscles: ["Lower core", "Hip flexors"],
      equipment: ["A mat"],
      purpose: "The lying leg raise works the lower core and the muscles that lift your legs, which is the part of your core that most exercises leave out.",
      start: "Lie on your back with your arms by your sides and your legs straight, with your hands under your bottom for support.",
      steps: [
        "Press your lower back gently into the floor.",
        "Lift both legs straight up until they are almost vertical.",
        "Keep them straight and lower them slowly until they are just above the floor.",
        "Stop before your lower back starts to arch.",
        "Repeat with control."
      ],
      sets: "3 sets of 10 to 15 reps", reps: "10 to 15 reps", rest: "60 seconds",
      breathing: "Breathe out as you lift and breathe in as you lower. Do not hold your breath.",
      mistakes: [
        "Letting your lower back arch off the floor on the way down.",
        "Bending your knees to make it easier without meaning to.",
        "Rushing the lowering phase, which is the part that does the work."
      ],
      safety: [
        "Stop if you feel a pinch in your lower back.",
        "Bend your knees if you cannot keep your back flat.",
        "Never pull on your neck to lift yourself up."
      ],
      easier: [
        "Bend your knees and lift them towards your chest instead.",
        "Lift the legs one at a time.",
        "Do the movement on a slight decline with your feet on a chair."
      ],
      gallery: ["ex/crunches.jpg"]
    },
    {
      id: "bicyclecrunch", name: "Bicycle Crunch", unit: "reps", type: "count",
      category: "Core", difficulty: "Intermediate",
      muscles: ["Obliques", "Upper core", "Hip flexors"],
      equipment: ["A mat"],
      purpose: "The bicycle crunch works the sides of the core and the hip flexors at the same time, and it is a good check on whether you can keep your lower back still while you move.",
      start: "Lie on your back with your hands lightly beside your ears, your legs lifted and your knees bent at 90 degrees.",
      steps: [
        "Lift your shoulders slightly off the floor and keep your neck long.",
        "Rotate your torso so one elbow comes towards the opposite knee.",
        "Return to the centre and switch sides.",
        "Keep your lower back pressed into the floor the whole time.",
        "Move slowly and do not rush the rotation."
      ],
      sets: "3 sets of 12 to 20 reps", reps: "12 to 20 reps", rest: "45 seconds",
      breathing: "Breathe out as you rotate and breathe in as you return to the centre.",
      mistakes: [
        "Pulling on your neck with your hands.",
        "Rushing so the legs swing and the core does nothing.",
        "Letting your lower back lift off the floor."
      ],
      safety: [
        "Stop if you feel neck or lower back pain.",
        "Keep your hands off your head if it strains your neck.",
        "Reduce the range of the rotation if your back starts to arch."
      ],
      easier: [
        "Keep both feet on the floor and only rotate your torso.",
        "Lift your shoulders a little less.",
        "Move more slowly."
      ],
      gallery: []
    },
    {
      id: "russiantwist", name: "Russian Twist", unit: "reps", type: "count",
      category: "Core", difficulty: "Beginner",
      muscles: ["Obliques", "Hip flexors", "Upper back"],
      equipment: ["A mat", "A dumbbell or a ball"],
      purpose: "The Russian twist trains the rotation of your trunk, the movement your body does when you reach for something in a car or twist to put a seat belt on.",
      start: "Sit on the floor with your knees bent, lean back slightly with a straight back, and hold a dumbbell or ball in both hands in front of your chest.",
      steps: [
        "Keep your chest lifted and your back straight as you lean back.",
        "Rotate your torso and move your hands to one side, past your hip.",
        "Rotate back through the centre to the other side.",
        "Keep the movement coming from your torso, not your arms.",
        "Go slowly — this is a control exercise."
      ],
      sets: "3 sets of 12 to 20 reps", reps: "12 to 20 reps", rest: "45 seconds",
      breathing: "Breathe out as you rotate to each side, and breathe in as you pass back through the middle.",
      mistakes: [
        "Rounding your back as you lean back.",
        "Swinging your arms and twisting very little.",
        "Going so fast that you lose your balance."
      ],
      safety: [
        "Stop if you feel pain in your lower back.",
        "Sit up more upright if your back starts to round.",
        "Use no weight at all until the movement feels easy."
      ],
      easier: [
        "Keep your feet flat on the floor for support.",
        "Sit more upright and reduce the lean back.",
        "Tap the floor beside your hip with each hand instead of holding a weight."
      ],
      gallery: []
    },
    {
      id: "hollowhold", name: "Hollow Hold", unit: "sec", type: "time",
      category: "Core", difficulty: "Advanced",
      muscles: ["Deep core", "Hip flexors", "Lower back"],
      equipment: ["A mat"],
      purpose: "The hollow hold is a strong test of deep core strength. It teaches you to hold your body in one shape, which is what protects your back in every other exercise.",
      start: "Lie on your back and press your lower back into the floor. Lift your shoulder blades and legs off the floor at the same time, so your body forms a shallow bowl.",
      steps: [
        "Keep your lower back pressed flat against the floor.",
        "Extend your arms past your ears if you can, or keep them by your sides if that is easier.",
        "Hold the position, breathing normally.",
        "Lower down to rest when you can no longer keep your back flat.",
        "Rest for the full rest period before the next set."
      ],
      sets: "3 sets of 20 to 45 seconds", reps: "Hold 20 to 45 seconds", rest: "60 seconds",
      breathing: "Keep breathing in and out steadily. Holding your breath will end the set early.",
      mistakes: [
        "Letting your lower back arch off the floor, which is the whole point of the exercise.",
        "Holding your breath for the entire set.",
        "Holding the position for far longer than your form lasts."
      ],
      safety: [
        "Stop if you feel any lower back pain — that means the position has gone.",
        "Bend your knees and raise them higher if your back lifts.",
        "Start with short holds and build up."
      ],
      easier: [
        "Keep your knees bent and your feet flat on the floor.",
        "Tuck your arms by your sides instead of overhead.",
        "Hold your arms forward rather than overhead."
      ],
      gallery: []
    },
    /* ---------------- lower body ---------------- */
    {
      id: "dumbbellsquat", name: "Dumbbell Squat", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quads", "Glutes", "Hamstrings", "Core"],
      equipment: ["A pair of dumbbells"],
      purpose: "The dumbbell squat is the simplest way to load your legs with real weight. It builds the quads and glutes that carry you up stairs and through a long session.",
      start: "Stand with your feet a little wider than your hips, toes turned out slightly, and hold a dumbbell in each hand beside your thighs.",
      steps: [
        "Take a breath and brace your stomach.",
        "Sit your hips back and down, bending your knees as your torso leans forward a little.",
        "Keep your chest up and your knees pointing in the same direction as your toes.",
        "Stand back up by driving through the whole foot.",
        "Stop squatting when your thighs are roughly parallel to the floor, or a little higher if that is hard."
      ],
      sets: "3 sets of 10 to 12 reps", reps: "10 to 12 reps", rest: "90 seconds",
      breathing: "Breathe in as you go down and breathe out as you stand up.",
      mistakes: [
        "Letting your knees travel inwards past your toes.",
        "Rounding your lower back at the bottom of the squat.",
        "Heeling up off the floor, which means you have gone too deep for your ankles.",
        "Rushing the descent and losing control at the bottom."
      ],
      safety: [
        "Stop if you feel sharp pain in your knees or lower back.",
        "Keep your knees behind your toes as a rule of thumb.",
        "Use a lighter weight until you can squat smoothly for a whole set."
      ],
      easier: [
        "Sit down to a chair and stand back up — that sets the depth for you.",
        "Hold the dumbbells at your shoulders instead of at your sides.",
        "Do a wall sit instead, which is gentler on the joints."
      ],
      gallery: ["ex/squat.jpg"]
    },
    {
      id: "romaniandeadlift", name: "Romanian Deadlift", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Intermediate",
      muscles: ["Hamstrings", "Glutes", "Lower back", "Core"],
      equipment: ["A pair of dumbbells or a barbell"],
      purpose: "The Romanian deadlift trains the back of your legs and your hips. It is the movement that fixes the stiff hamstrings and protects your lower back when you lift anything heavy.",
      start: "Stand tall with a dumbbell in each hand held in front of your thighs, with your feet hip width apart.",
      steps: [
        "Soften your knees slightly and keep them in the same position the whole set.",
        "Push your hips backwards, letting the dumbbells slide down your thighs.",
        "Keep your back flat and your chest open as the weights pass your knees.",
        "Stop when you feel a strong stretch in the back of your legs, or when the weights reach your shins.",
        "Drive your hips forward to stand back up and squeeze your glutes at the top."
      ],
      sets: "3 sets of 8 to 12 reps", reps: "8 to 12 reps", rest: "90 to 120 seconds",
      breathing: "Breathe in as you lower the weights and breathe out as you stand up.",
      mistakes: [
        "Bending your knees into a squat instead of pushing your hips back.",
        "Rounding your back as the weights reach your shins.",
        "Swinging the weights away from your body.",
        "Going down too far and losing your flat back."
      ],
      safety: [
        "Stop if you feel sharp pain in your lower back or hamstring.",
        "Keep the weights close to your legs the whole way down.",
        "Start with a light weight to learn the hip hinge."
      ],
      easier: [
        "Do it with no weight at all until the movement feels natural.",
        "Do it with a shorter range of motion, stopping just below the knee.",
        "Hold a wall or a chair for balance while you learn it."
      ],
      gallery: []
    },
    {
      id: "bulgariansplitsquat", name: "Bulgarian Split Squat", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Intermediate",
      muscles: ["Quads", "Glutes", "Hamstrings", "Core"],
      equipment: ["A bench or a chair", "A pair of dumbbells"],
      purpose: "The Bulgarian split squat is the hardest leg movement you can do without a barbell. It builds each leg on its own, which balances out any difference between your left and your right.",
      start: "Stand about two foot lengths in front of a bench or chair and rest the top of one foot on it behind you. Hold a dumbbell in each hand.",
      steps: [
        "Lean your torso forward slightly and keep your back straight.",
        "Lower your back knee straight down towards the floor.",
        "Stop when your front thigh is roughly parallel to the floor.",
        "Drive through your front heel to stand back up.",
        "Complete all your reps on one leg, then change sides."
      ],
      sets: "3 sets of 8 to 10 reps per leg", reps: "8 to 10 reps per leg", rest: "90 seconds",
      breathing: "Breathe in as you lower and breathe out as you stand up.",
      mistakes: [
        "Placing your back foot too close, which puts too much load on the front knee.",
        "Leaning too far forward over your front knee.",
        "Letting your front knee travel past your toes."
      ],
      safety: [
        "Stop if you feel sharp pain in your front knee.",
        "Hold a wall for balance if you wobble.",
        "Do a normal split squat first if this feels too hard on your knees."
      ],
      easier: [
        "Hold the rear foot lightly rather than resting it on the bench.",
        "Do the movement with no weight at all.",
        "Shorten the range and stop higher."
      ],
      gallery: []
    },
    {
      id: "walkinglunge", name: "Walking Lunge", unit: "reps", type: "count",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quads", "Glutes", "Hamstrings", "Core"],
      equipment: ["None needed", "Dumbbells if you want more"],
      purpose: "The walking lunge trains one leg at a time and moves as you go, so it trains your balance and your legs at the same time.",
      start: "Stand tall with your feet hip width apart and your hands on your hips or holding dumbbells at your sides.",
      steps: [
        "Step forward with one leg and lower your back knee towards the floor.",
        "Keep your front knee behind your toes and your back heel lifted.",
        "Push through your front foot to bring your back leg forward into the next lunge.",
        "Keep walking in a steady rhythm.",
        "Stop when you have done the set, then turn around and walk back."
      ],
      sets: "3 sets of 10 to 12 steps per leg", reps: "10 to 12 steps per leg", rest: "90 seconds",
      breathing: "Breathe in as you lower and breathe out as you push up.",
      mistakes: [
        "Letting your front knee travel past your toes.",
        "Stepping so short that your back knee never bends.",
        "Leaning forwards as you step."
      ],
      safety: [
        "Stop if you feel sharp pain in your knee.",
        "Take shorter steps if you are losing balance.",
        "Hold onto a wall if you need to."
      ],
      easier: [
        "Do stationary lunges, stepping back and returning to the same spot.",
        "Hold a chair or a wall for support.",
        "Do the movement without any weight."
      ],
      gallery: []
    },
    {
      id: "stepup", name: "Step Up", unit: "kg", type: "weight",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Quads", "Glutes", "Core"],
      equipment: ["A bench, a box or a sturdy step"],
      purpose: "The step up trains the front of your legs and your balance, and it is a good first step towards lunging and stair-climbing strength.",
      start: "Stand in front of a bench or box that is about knee height, with your foot flat on the floor in front of it.",
      steps: [
        "Place one foot flat on the bench and keep your body upright.",
        "Drive through that heel and lift your body up onto the box.",
        "Stand tall on the box for a moment without wobbling.",
        "Step back down under control.",
        "Complete all your reps on one leg, then change sides."
      ],
      sets: "3 sets of 8 to 10 reps per leg", reps: "8 to 10 reps per leg", rest: "60 seconds",
      breathing: "Breathe out as you step up and breathe in as you step down.",
      mistakes: [
        "Pushing off the floor foot instead of driving through the raised heel.",
        "Leaning forwards over the knee on the box.",
        "Stepping up so fast that you land heavily on the box."
      ],
      safety: [
        "Stop if you feel pain in your knee.",
        "Use a lower step if you cannot control the movement.",
        "Make sure the bench cannot slide before you start."
      ],
      easier: [
        "Use a much lower step, such as a stair.",
        "Hold a wall for balance.",
        "Do the step up holding a light weight in both hands."
      ],
      gallery: []
    },
    {
      id: "glutebridge", name: "Glute Bridge", unit: "reps", type: "count",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Glutes", "Hamstrings", "Core"],
      equipment: ["A mat"],
      purpose: "The glute bridge wakes up the glutes and teaches your body to use them when you lift, which takes pressure off your lower back.",
      start: "Lie on your back with your knees bent and your feet flat on the floor, close to your bottom. Rest your arms by your sides.",
      steps: [
        "Press through your heels and lift your hips until your body forms a straight line from your knees to your shoulders.",
        "Squeeze your glutes hard at the top and hold for a second.",
        "Lower your hips slowly until they almost touch the floor.",
        "Repeat without letting your back arch at the top."
      ],
      sets: "3 sets of 12 to 15 reps", reps: "12 to 15 reps", rest: "45 seconds",
      breathing: "Breathe out as you lift your hips and breathe in as you lower them.",
      mistakes: [
        "Overarching your lower back at the top instead of using your glutes.",
        "Pushing through your toes rather than your heels.",
        "Rushing up and down so the glutes never really squeeze."
      ],
      safety: [
        "Stop if you feel pinch in your lower back.",
        "Do the movement without lifting your hips if it hurts.",
        "Keep your feet flat and your knees pointing forwards."
      ],
      easier: [
        "Do smaller lifts, only halfway up.",
        "Hold the squeeze for longer rather than doing more reps.",
        "Squeeze a ball between your knees if that helps you feel your glutes."
      ],
      gallery: []
    },
    {
      id: "calfraise", name: "Calf Raise", unit: "reps", type: "count",
      category: "Lower body", difficulty: "Beginner",
      muscles: ["Calves"],
      equipment: ["None needed", "A step to stand on"],
      purpose: "Calf raises build the muscles that hold your ankles steady. They also help with shin splints and with the ankle stiffness that comes from a lot of standing.",
      start: "Stand tall with your feet hip width apart and your weight on the balls of your feet.",
      steps: [
        "Rise up onto the balls of your feet as high as you can.",
        "Hold at the top for a moment and squeeze your calves.",
        "Lower your heels slowly until you feel a stretch in your calves.",
        "Repeat, keeping your knees straight for this exercise."
      ],
      sets: "3 sets of 15 to 20 reps", reps: "15 to 20 reps", rest: "45 seconds",
      breathing: "Breathe out as you go up and breathe in as you come down.",
      mistakes: [
        "Bouncing so fast that you never feel the squeeze at the top.",
        "Rolling your ankles instead of using the whole foot.",
        "Going so high that you roll onto your toes."
      ],
      safety: [
        "Stop if you feel a sharp pull in your calf or Achilles tendon.",
        "Stand near a wall for support if you are unsure.",
        "Stand with your toes hanging off a step for a bigger range, once you are comfortable."
      ],
      easier: [
        "Do the movement with one leg at a time and hold a wall.",
        "Do half range lifts only.",
        "Keep both hands on the back of a chair for balance."
      ],
      gallery: []
    },
    /* ---------------- cardio ---------------- */
    {
      id: "jumprope", name: "Jump Rope", unit: "min", type: "time",
      category: "Cardio", difficulty: "Beginner",
      muscles: ["Calves", "Shoulders", "Core"],
      equipment: ["A jump rope", "or imagine skipping on the spot"],
      purpose: "Jump rope trains your heart and lungs while asking very little of your joints. It is one of the quickest ways to raise your heart rate in a small space.",
      start: "Stand in the middle of a space with your feet together and hold the rope handles in your hands, one in each, with your elbows close to your sides.",
      steps: [
        "Turn the rope with your wrists, not your arms, and jump just high enough for the rope to pass under you.",
        "Keep the jumps low and light, landing softly on the balls of your feet.",
        "Keep your arms close to your body and your hands at your waist height.",
        "Build up to a steady rhythm and hold it.",
        "Stop and shake your arms out if your shoulders start to burn."
      ],
      sets: "3 rounds of 1 to 3 minutes", reps: "1 to 3 minutes", rest: "60 seconds",
      breathing: "Breathe steadily through your nose and mouth. Do not hold your breath.",
      mistakes: [
        "Swinging the rope with big arm movements, which tires your shoulders.",
        "Jumping too high and landing hard on your toes.",
        "Skipping for too long at full effort and giving up halfway."
      ],
      safety: [
        "Stop if you feel pain in your calves, knees or shoulders.",
        "Use a soft surface if you have hard floors.",
        "Check the rope length — it should reach just below your armpits when you hold the handles."
      ],
      easier: [
        "Skip without a rope, on the spot.",
        "Do 20 jumps, then 20 seconds of rest, and repeat.",
        "Do the movement for 30 seconds at a time and build up."
      ],
      gallery: []
    },
    {
      id: "highknees", name: "High Knees", unit: "sec", type: "time",
      category: "Cardio", difficulty: "Beginner",
      muscles: ["Hip flexors", "Calves", "Core"],
      equipment: ["None needed"],
      purpose: "High knees lift your heart rate quickly and wake up the muscles that lift your knees, which is what makes running feel easier.",
      start: "Stand tall with your feet hip width apart and your arms bent at your sides.",
      steps: [
        "Drive one knee up to about hip height while staying on the ball of the other foot.",
        "Switch legs quickly and keep a steady rhythm.",
        "Stay on the balls of your feet and keep your knees pointing forward.",
        "Pump your arms in time with your legs.",
        "Keep your posture upright and your core tight."
      ],
      sets: "4 rounds of 20 to 30 seconds", reps: "20 to 30 seconds", rest: "30 seconds",
      breathing: "Breathe steadily. Do not hold your breath as you get tired.",
      mistakes: [
        "Leaning backwards as your knees come up.",
        "Lifting your knees only to waist height.",
        "Letting your arms swing wildly out of rhythm."
      ],
      safety: [
        "Stop if you feel pain in your knees or lower back.",
        "Start with a smaller knee lift if you are new to it.",
        "Keep the surface clear in front of you."
      ],
      easier: [
        "Do marching knee lifts instead of running.",
        "Do 10 seconds on, 10 seconds off, and repeat.",
        "Hold a wall for balance while you build the rhythm."
      ],
      gallery: []
    },
    {
      id: "mountainclimber", name: "Mountain Climbers", unit: "sec", type: "time",
      category: "Cardio", difficulty: "Intermediate",
      muscles: ["Core", "Shoulders", "Hip flexors", "Cardio"],
      equipment: ["A mat"],
      purpose: "Mountain climbers raise your heart rate and train your core at the same time, because your body has to stay still while your legs move fast.",
      start: "Start in a push up position with your hands under your shoulders and your feet behind you.",
      steps: [
        "Keep your shoulders over your hands and your body in a straight line.",
        "Drive one knee towards your chest.",
        "Switch legs quickly, keeping your hips level.",
        "Keep your core tight and your breathing steady.",
        "Slow the pace down before your form breaks."
      ],
      sets: "4 rounds of 20 to 40 seconds", reps: "20 to 40 seconds", rest: "30 seconds",
      breathing: "Breathe in and out in a steady rhythm, and do not hold your breath.",
      mistakes: [
        "Letting your hips bounce up and down.",
        "Dropping onto your hands and shoulders.",
        "Going so fast that your form disappears."
      ],
      safety: [
        "Stop if you feel wrist or shoulder pain.",
        "Do the movement from your knees if it strains your wrists.",
        "Slow the pace down rather than pushing through pain."
      ],
      easier: [
        "Do slow mountain climbers, one leg at a time.",
        "Hold a plank for 30 seconds between sets instead.",
        "Keep one foot on the floor and switch sides."
      ],
      gallery: []
    },
    /* ---------------- mobility ---------------- */
    {
      id: "worldsgreateststretch", name: "World's Greatest Stretch", unit: "reps", type: "count",
      category: "Mobility", difficulty: "Beginner",
      muscles: ["Hip flexors", "Hamstrings", "Lower back", "Thoracic spine"],
      equipment: ["A mat"],
      purpose: "This is the most useful stretch for people who sit at a desk or drive for a living. It opens the hips, the hamstrings and the lower back in one go.",
      start: "Start in a push up position with your hands under your shoulders and your feet behind you.",
      steps: [
        "Step your right foot forward so it lands outside your right hand.",
        "Keep your back leg straight and your hips low.",
        "Reach your right arm up towards the ceiling and turn your chest to follow it.",
        "Hold for two to three seconds, breathing deeply.",
        "Place your hand down and walk your hands forward into a straight arm stretch, then step your other foot through and repeat on the other side."
      ],
      sets: "2 to 3 sets of 5 reps per side", reps: "5 reps per side", rest: "30 seconds",
      breathing: "Breathe deeply into your belly, especially when you reach your arm up.",
      mistakes: [
        "Forcing the reach and jamming the shoulder towards the ear.",
        "Letting your back heel lift off the floor.",
        "Rushing through it instead of breathing into the stretch."
      ],
      safety: [
        "Stop if you feel sharp pain in the back of your knee.",
        "Shorten your stance if the back of your leg feels tight.",
        "Do not bounce — hold the stretch and breathe."
      ],
      easier: [
        "Keep both hands on the floor instead of reaching up.",
        "Bend the back knee to lower the stretch on the hamstring.",
        "Do it beside a wall for balance."
      ],
      gallery: []
    },
    {
      id: "shoulderwallslide", name: "Shoulder Wall Slide", unit: "reps", type: "count",
      category: "Mobility", difficulty: "Beginner",
      muscles: ["Shoulders", "Upper back", "Thoracic spine"],
      equipment: ["A wall"],
      purpose: "The shoulder wall slide opens up a chest and shoulders that have been rounded forward by hours at a desk, and it teaches your shoulders to move without pain.",
      start: "Stand with your back against a wall, a short distance from it, with your feet a little in front of your hips.",
      steps: [
        "Press the small of your back gently into the wall and keep it there.",
        "Bend your elbows to 90 degrees and press your forearms and the backs of your hands into the wall.",
        "Slide your arms up the wall as far as you can without your lower back coming off the wall.",
        "Pause at the top, then slide back down.",
        "Keep the movement slow and do not force the range."
      ],
      sets: "3 sets of 10 to 15 reps", reps: "10 to 15 reps", rest: "45 seconds",
      breathing: "Breathe in as you slide down and breathe out as you slide up.",
      mistakes: [
        "Letting your lower back arch away from the wall as your arms go up.",
        "Moving too fast, which turns it into a shoulder roll.",
        "Holding your breath at the top."
      ],
      safety: [
        "Stop if you feel a pinch in the front of your shoulder.",
        "Slide up only as far as you can comfortably.",
        "Reduce the range over the coming weeks rather than forcing it."
      ],
      easier: [
        "Do the movement without a wall, just the arm slide.",
        "Slide only halfway up.",
        "Use a resistance band between your hands if you want more work."
      ],
      gallery: []
    },
    {
      id: "hipcircle", name: "Hip Circles", unit: "reps", type: "count",
      category: "Mobility", difficulty: "Beginner",
      muscles: ["Hip flexors", "Hips", "Lower back"],
      equipment: ["None needed"],
      purpose: "Hip circles move the joint itself, not just the muscles around it. They are a good warm up before any leg session and they ease hips that have got stiff from sitting.",
      start: "Stand tall with your feet together and put your hands on your hips.",
      steps: [
        "Lift one knee up towards your chest.",
        "Move the knee out to the side in a smooth circle.",
        "Bring it down and across to the other side, completing the circle.",
        "Do 10 circles on one leg, then change legs.",
        "Keep the movement slow and keep your standing leg still."
      ],
      sets: "2 sets of 10 circles per leg", reps: "10 circles per leg", rest: "30 seconds",
      breathing: "Keep breathing normally throughout the circles.",
      mistakes: [
        "Rushing the circles so the hip never actually moves through its range.",
        "Twisting your whole body instead of moving the hip.",
        "Holding your breath as you circle."
      ],
      safety: [
        "Stop if you feel a sharp click or pain in the hip.",
        "Make the circles smaller if they feel uncomfortable.",
        "Hold onto a wall for balance if you are unsteady."
      ],
      easier: [
        "Do the circles lying on your back instead of standing.",
        "Make the circles half the size.",
        "Hold a chair for support."
      ],
      gallery: []
    },
    {
      id: "thoracicrotation", name: "Thoracic Spine Rotation", unit: "reps", type: "count",
      category: "Mobility", difficulty: "Beginner",
      muscles: ["Thoracic spine", "Upper back", "Core"],
      equipment: ["A mat", "A chair for support"],
      purpose: "Rotation exercises undo the stiffness that comes from bending and sitting. They are what you need before a squat, a swing or a throw.",
      start: "Start on all fours with your hands under your shoulders and your knees under your hips.",
      steps: [
        "Place one hand on the back of your head, keeping your elbow wide.",
        "Rotate your chest and that elbow up towards the ceiling.",
        "Follow your top elbow with your eyes.",
        "Hold for two seconds and breathe into the movement.",
        "Return to all fours and change sides."
      ],
      sets: "2 sets of 8 reps per side", reps: "8 reps per side", rest: "30 seconds",
      breathing: "Breathe in at the start and breathe out as you rotate further.",
      mistakes: [
        "Rotating from the hips instead of the middle of your back.",
        "Rushing so the movement happens only at the very end of the range.",
        "Holding your breath."
      ],
      safety: [
        "Stop if you feel sharp pain in your back.",
        "Do a smaller rotation if it feels tight.",
        "Keep the movement slow and follow your elbow with your eyes."
      ],
      easier: [
        "Do the rotation standing, holding a chair with both hands.",
        "Lower the elbow towards the floor first and work up from there.",
        "Do 5 reps per side and build up over time."
      ],
      gallery: []
    }
  ];

  var D = global.GBData;
  if (!D || !D.exercises) return;

  /* Never add the same movement twice. */
  var seen = {};
  D.exercises.forEach(function (e) { seen[e.id] = true; });
  var added = [];
  MORE.forEach(function (e) {
    if (seen[e.id]) return;
    seen[e.id] = true;
    added.push(e);
  });

  D.exercises = D.exercises.concat(added);
})(typeof window !== "undefined" ? window : this);
