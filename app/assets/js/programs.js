/* ==========================================================================
   GYM BADGE — training programs

   Each program is a real, usable routine: the days it runs, and the
   movements on each day. Loading a program writes these into the
   member's own My Routine, so the routine screen is never empty and
   the program covers are not decoration.

   The movement ids match the exercise catalogue in data.js.
   ========================================================================== */
(function (global) {
  "use strict";

  var PROGRAMS = [
    {
      id: "overall",
      name: "Overall Fitness",
      sub: "Full body, twice a week",
      tag: "ovf",
      img: "lib/program-1.jpg",
      days: 2,
      daysLabel: "2 Days a Week",
      level: "Beginner",
      focus: "Building the habit and a strong base",
      split: [
        { name: "Full body", items: [
          { ex: "gobletsquat", sets: 3, reps: "10 reps", rest: "60 to 90 seconds" },
          { ex: "pushup", sets: 3, reps: "8 to 12 reps", rest: "60 to 90 seconds" },
          { ex: "dumbbellrow", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "lunge", sets: 3, reps: "10 reps each leg", rest: "60 to 90 seconds" },
          { ex: "plank", sets: 3, reps: "Hold 30 to 45 seconds", rest: "45 to 60 seconds" }
        ]},
        { name: "Full body", items: [
          { ex: "squat", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "latpulldown", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "benchdips", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "legcurl", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "crunches", sets: 3, reps: "20 reps", rest: "45 to 60 seconds" }
        ]}
      ]
    },
    {
      id: "lean",
      name: "Get Lean",
      sub: "Upper and lower split",
      tag: "lean",
      img: "lib/program-3.jpg",
      days: 3,
      daysLabel: "3 Days a Week",
      level: "Intermediate",
      focus: "Keeping muscle while you lose fat",
      split: [
        { name: "Upper body", items: [
          { ex: "benchpress", sets: 4, reps: "8 reps", rest: "90 to 120 seconds" },
          { ex: "latpulldown", sets: 4, reps: "10 reps", rest: "90 to 120 seconds" },
          { ex: "shoulderpress", sets: 3, reps: "10 reps", rest: "60 to 90 seconds" },
          { ex: "bicepcurl", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" }
        ]},
        { name: "Lower body", items: [
          { ex: "squat", sets: 4, reps: "10 reps", rest: "90 to 120 seconds" },
          { ex: "lunge", sets: 3, reps: "12 reps each leg", rest: "60 to 90 seconds" },
          { ex: "legcurl", sets: 4, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "hipflexorstretch", sets: 2, reps: "Hold 30 seconds each side", rest: "30 seconds" }
        ]},
        { name: "Conditioning", items: [
          { ex: "burpee", sets: 4, reps: "10 reps", rest: "90 seconds" },
          { ex: "cycling", sets: 1, reps: "15 minutes", rest: "—" },
          { ex: "catcow", sets: 2, reps: "10 reps", rest: "30 seconds" }
        ]}
      ]
    },
    {
      id: "muscle",
      name: "Build Muscle",
      sub: "Push, pull and legs",
      tag: "mus",
      img: "lib/program-5.jpg",
      days: 4,
      daysLabel: "4 Days a Week",
      level: "Intermediate",
      focus: "Adding size and strength",
      split: [
        { name: "Push", items: [
          { ex: "benchpress", sets: 4, reps: "6 to 8 reps", rest: "2 to 3 minutes" },
          { ex: "inclinepress", sets: 3, reps: "10 reps", rest: "90 to 120 seconds" },
          { ex: "shoulderpress", sets: 3, reps: "10 reps", rest: "90 to 120 seconds" },
          { ex: "benchdips", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" }
        ]},
        { name: "Pull", items: [
          { ex: "pullup", sets: 4, reps: "4 to 8 reps", rest: "2 to 3 minutes" },
          { ex: "latpulldown", sets: 4, reps: "10 reps", rest: "90 to 120 seconds" },
          { ex: "dumbbellrow", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "bicepcurl", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" }
        ]},
        { name: "Legs", items: [
          { ex: "squat", sets: 4, reps: "8 reps", rest: "2 to 3 minutes" },
          { ex: "legpress", sets: 4, reps: "10 reps", rest: "90 to 120 seconds" },
          { ex: "legcurl", sets: 4, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "lunge", sets: 3, reps: "12 reps each leg", rest: "60 to 90 seconds" }
        ]},
        { name: "Core", items: [
          { ex: "plank", sets: 3, reps: "Hold 45 seconds", rest: "45 to 60 seconds" },
          { ex: "situp", sets: 3, reps: "15 reps", rest: "45 to 60 seconds" },
          { ex: "bandlateralraise", sets: 3, reps: "15 reps", rest: "45 to 60 seconds" }
        ]}
      ]
    },
    {
      id: "athletic",
      name: "Athletic Power",
      sub: "Full body with power",
      tag: "ovf",
      img: "lib/program-2.jpg",
      days: 3,
      daysLabel: "3 Days a Week",
      level: "Advanced",
      focus: "Speed, power and work capacity",
      split: [
        { name: "Power", items: [
          { ex: "squat", sets: 5, reps: "5 reps", rest: "2 to 3 minutes" },
          { ex: "benchpress", sets: 5, reps: "5 reps", rest: "2 to 3 minutes" },
          { ex: "burpee", sets: 4, reps: "12 reps", rest: "90 seconds" }
        ]},
        { name: "Strength", items: [
          { ex: "deadlift", sets: 4, reps: "5 reps", rest: "3 minutes" },
          { ex: "pullup", sets: 4, reps: "6 reps", rest: "2 to 3 minutes" },
          { ex: "legpress", sets: 4, reps: "10 reps", rest: "90 to 120 seconds" }
        ]},
        { name: "Conditioning", items: [
          { ex: "rowing", sets: 5, reps: "500 metres", rest: "90 seconds" },
          { ex: "cycling", sets: 1, reps: "20 minutes", rest: "—" },
          { ex: "burpee", sets: 4, reps: "15 reps", rest: "60 to 90 seconds" }
        ]}
      ]
    },
    {
      id: "conditioning",
      name: "Conditioning",
      sub: "Cardio and core",
      tag: "lean",
      img: "lib/program-7.jpg",
      days: 4,
      daysLabel: "4 Days a Week",
      level: "Beginner",
      focus: "Endurance, core and mobility",
      split: [
        { name: "Cardio", items: [
          { ex: "treadmill", sets: 1, reps: "20 minutes", rest: "—" },
          { ex: "cycling", sets: 1, reps: "20 minutes", rest: "—" }
        ]},
        { name: "Core", items: [
          { ex: "plank", sets: 3, reps: "Hold 45 seconds", rest: "45 to 60 seconds" },
          { ex: "crunches", sets: 3, reps: "20 reps", rest: "45 to 60 seconds" },
          { ex: "situp", sets: 3, reps: "15 reps", rest: "45 to 60 seconds" }
        ]},
        { name: "Mixed", items: [
          { ex: "burpee", sets: 4, reps: "10 reps", rest: "90 seconds" },
          { ex: "rowing", sets: 4, reps: "500 metres", rest: "90 seconds" }
        ]},
        { name: "Mobility", items: [
          { ex: "catcow", sets: 2, reps: "12 reps", rest: "30 seconds" },
          { ex: "hipflexorstretch", sets: 2, reps: "Hold 30 seconds each side", rest: "30 seconds" },
          { ex: "bandlateralraise", sets: 3, reps: "15 reps", rest: "45 to 60 seconds" }
        ]}
      ]
    },
    {
      id: "strength",
      name: "Strength Base",
      sub: "Push, pull and legs",
      tag: "mus",
      img: "lib/program-9.jpg",
      days: 2,
      daysLabel: "2 Days a Week",
      level: "Beginner",
      focus: "Strength fundamentals, twice a week",
      split: [
        { name: "Upper body", items: [
          { ex: "benchpress", sets: 3, reps: "8 reps", rest: "2 minutes" },
          { ex: "latpulldown", sets: 3, reps: "10 reps", rest: "2 minutes" },
          { ex: "dumbbellrow", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" }
        ]},
        { name: "Lower body", items: [
          { ex: "squat", sets: 3, reps: "10 reps", rest: "2 minutes" },
          { ex: "legcurl", sets: 3, reps: "12 reps", rest: "60 to 90 seconds" },
          { ex: "lunge", sets: 3, reps: "10 reps each leg", rest: "60 to 90 seconds" }
        ]}
      ]
    }
  ];

  function byId(id) {
    for (var i = 0; i < PROGRAMS.length; i++) if (PROGRAMS[i].id === id) return PROGRAMS[i];
    return null;
  }

  global.GBPrograms = { list: function () { return PROGRAMS; }, byId: byId };
})(typeof window !== "undefined" ? window : this);
