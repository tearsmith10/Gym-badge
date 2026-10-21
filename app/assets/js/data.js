/* GYM BADGE — seed & reference data (offline) */
window.GBData = (function () {
  "use strict";

  var countries = ["Nigeria","Ghana","Kenya","South Africa","Egypt","United Kingdom","United States","Canada","Australia","Germany","France","India","United Arab Emirates","Brazil","Mexico","Japan","Other"];

  var goals = ["Lose weight","Build muscle","Get toned","Improve endurance","General fitness","Strength & power"];

  var exercises = [
    { id:"pushup", name:"Push Ups", unit:"reps", type:"count" },
    { id:"situp", name:"Sit Ups", unit:"reps", type:"count" },
    { id:"squat", name:"Squats", unit:"reps", type:"count" },
    { id:"pullup", name:"Pull Ups", unit:"reps", type:"count" },
    { id:"plank", name:"Plank", unit:"sec", type:"time" },
    { id:"burpee", name:"Burpees", unit:"reps", type:"count" },
    { id:"treadmill", name:"Treadmill", unit:"min", type:"time" },
    { id:"cycling", name:"Cycling", unit:"min", type:"time" },
    { id:"rowing", name:"Rowing", unit:"min", type:"time" },
    { id:"benchpress", name:"Bench press", unit:"kg", type:"weight" },
    { id:"deadlift", name:"Deadlift", unit:"kg", type:"weight" },
    { id:"shoulderpress", name:"Shoulder press", unit:"kg", type:"weight" },
    { id:"bicepcurl", name:"Bicep curl", unit:"kg", type:"weight" },
    { id:"latpulldown", name:"Lat pulldown", unit:"kg", type:"weight" },
    { id:"legpress", name:"Leg press", unit:"kg", type:"weight" },
    { id:"gobletsquat", name:"Goblet Squat", unit:"reps", type:"count" },
    { id:"benchdips", name:"Bench Dips", unit:"reps", type:"count" },
    { id:"legcurl", name:"Leg Curl", unit:"kg", type:"weight" },
    { id:"crunches", name:"Crunches", unit:"reps", type:"count" },
    { id:"inclinepress", name:"Incline Press", unit:"kg", type:"weight" },
    { id:"dumbbellrow", name:"Dumbbell Row", unit:"kg", type:"weight" }
  ];

  // Gym equipment with one of 5 status states.
  var equipment = [
    { id:"eq1", name:"Treadmill 01", zone:"Cardio", status:"usable", lastMaint:"2026-09-28", uses:12 },
    { id:"eq2", name:"Treadmill 02", zone:"Cardio", status:"overused", lastMaint:"2026-08-14", uses:64 },
    { id:"eq3", name:"Dumbbell rack A", zone:"Weights", status:"usable", lastMaint:"2026-10-02", uses:8 },
    { id:"eq4", name:"Bench press", zone:"Weights", status:"maintenance", lastMaint:"2026-10-10", uses:0 },
    { id:"eq5", name:"Lat pulldown", zone:"Machines", status:"faulty", lastMaint:"2026-07-30", uses:0 },
    { id:"eq6", name:"Leg press", zone:"Machines", status:"usable", lastMaint:"2026-10-05", uses:20 },
    { id:"eq7", name:"Rowing machine", zone:"Cardio", status:"unusable", lastMaint:"2026-06-18", uses:0 }
  ];

  var statusMeta = {
    usable:      { label:"Usable",           pill:"ok",   icon:"✓", desc:"Good to go — safe to use now." },
    maintenance: { label:"Under maintenance", pill:"warn", icon:"🔧", desc:"Servicing in progress. Back soon." },
    unusable:    { label:"Not usable",       pill:"bad",  icon:"⛔", desc:"Temporarily out of service." },
    faulty:      { label:"Faulty",           pill:"bad",  icon:"⚠️", desc:"Reported fault — please avoid." },
    overused:    { label:"Overused",         pill:"warn", icon:"📈", desc:"Heavy traffic today. Try off peak." }
  };

  var foods = {
    "jollof rice":   { kcal:380, carbs:58, protein:9,  fat:12, fiber:3, verdict:"watch" },
    "grilled chicken":{ kcal:165, carbs:0,  protein:31, fat:3.6, fiber:0, verdict:"good" },
    "fried rice":    { kcal:350, carbs:55, protein:8,  fat:11, fiber:2, verdict:"watch" },
    "beans":         { kcal:240, carbs:40, protein:13, fat:1,  fiber:12, verdict:"good" },
    "banana":        { kcal:105, carbs:27, protein:1.3,fat:0.4,fiber:3, verdict:"good" },
    "pizza":         { kcal:285, carbs:36, protein:12, fat:10, fiber:2.5, verdict:"off" },
    "burger":        { kcal:550, carbs:42, protein:26, fat:29, fiber:3, verdict:"off" },
    "salad":         { kcal:120, carbs:10, protein:3,  fat:7,  fiber:4, verdict:"good" },
    "suya":          { kcal:290, carbs:5,  protein:28, fat:18, fiber:1, verdict:"watch" },
    "swallow":       { kcal:320, carbs:70, protein:3,  fat:1,  fiber:2, verdict:"watch" },
    "egg":           { kcal:78,  carbs:0.6,protein:6,  fat:5,  fiber:0, verdict:"good" },
    "oatmeal":       { kcal:150, carbs:27, protein:5,  fat:3,  fiber:4, verdict:"good" }
  };

  var archetypes = [
    { id:"lean",   icon:"🏃", name:"Lean & Toned",  desc:"Low fat, defined" },
    { id:"muscle", icon:"💪", name:"Muscular",      desc:"Size & mass" },
    { id:"athletic",icon:"⚡",name:"Athletic",      desc:"Power & speed" },
    { id:"curves", icon:"🍑", name:"Curves",        desc:"Glutes & waist" },
    { id:"slim",   icon:"🌿", name:"Slim & Strong", desc:"Petite, strong" },
    { id:"bulk",   icon:"🏋️", name:"Bulk & Power",  desc:"Thick & strong" }
  ];

  var gyms = [
    { id:"g1", name:"Iron House Gym",  dist:0.4, open:true,  x:28, y:34, tags:["Cardio","Weights","24/7"] },
    { id:"g2", name:"FitZone Central", dist:1.1, open:true,  x:62, y:26, tags:["Classes","Pool"] },
    { id:"g3", name:"PowerHouse Fitness",dist:1.8,open:false, x:44, y:66, tags:["Weights","Sauna"] },
    { id:"g4", name:"Pulse Studio",    dist:2.3, open:true,  x:76, y:58, tags:["HIIT","Yoga"] },
    { id:"g5", name:"Your Gym — Iron House (Branch 2)", dist:0.9, open:true, x:38, y:50, tags:["Member gym"] }
  ];

  // Neuromarketing feature names used in app.
  var features = {
    id:      { name:"First Rep",    tagline:"Your goal, dialled in" },
    beat:    { name:"One More",     tagline:"One number to beat" },
    tap:     { name:"Tap In",       tagline:"Know before you queue" },
    plate:   { name:"Plate Truth",  tagline:"See it before you eat it" },
    future:  { name:"Tomorrow You", tagline:"Meet the body you're building" },
    find:    { name:"Your Floor",   tagline:"The gym that's yours" }
  };

  return {
    countries:countries, goals:goals, exercises:exercises, equipment:equipment,
    statusMeta:statusMeta, foods:foods, archetypes:archetypes, gyms:gyms, features:features
  };
})();
