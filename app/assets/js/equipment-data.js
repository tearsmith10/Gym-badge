/* ==========================================================================
   GYM BADGE — the gym floor catalogue

   Every machine on the floor, with a real photograph of it and the written
   status report the gym supplies: why it is out of service, what was
   reported, when it is expected back, what to do in the meantime and who is
   dealing with it.

   Nothing here is invented. When the gym has not told us something, the
   report says exactly that.

   The photographs are real pictures of these machines. Where a machine and
   the exercise that uses it share a photograph, it is the same machine
   photographed once, shown in both places — never an unrelated picture
   borrowed to fill a gap.
   ========================================================================== */
(function (global) {
  "use strict";

  var D = global.GBData;
  if (!D) return;

  var EQUIPMENT = [
    /* ---------------- cardio ---------------- */
    {
      id: "eq1", name: "Treadmill 01", zone: "Cardio", status: "usable",
      photos: ["eq/eq1-treadmill-01-1.jpg", "eq/eq1-treadmill-01-2.jpg"],
      lastMaint: "2026-09-28", uses: 12, updatedAt: "2026-10-14T09:12:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq2", name: "Treadmill 02", zone: "Cardio", status: "overused",
      photos: ["eq/eq2-treadmill-02-1.jpg"],
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
      id: "eq7", name: "Rowing machine", zone: "Cardio", status: "unusable",
      photos: ["eq/eq7-rowing-1.jpg"],
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
      id: "eq14", name: "Rowing machine 02", zone: "Cardio", status: "usable",
      photos: ["eq/eq14-rowing-02-1.jpg", "eq/eq14-rowing-02-2.jpg", "eq/eq14-rowing-02-3.jpg"],
      lastMaint: "2026-09-30", uses: 18, updatedAt: "2026-10-14T08:10:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq9", name: "Elliptical trainer", zone: "Cardio", status: "usable",
      photos: ["eq/eq9-elliptical-1.jpg"],
      lastMaint: "2026-09-19", uses: 22, updatedAt: "2026-10-13T17:25:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq10", name: "Spin bike", zone: "Cardio", status: "usable",
      photos: ["eq/eq10-spin-bike-1.jpg"],
      lastMaint: "2026-08-24", uses: 15, updatedAt: "2026-10-12T10:05:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq11", name: "Assault bike", zone: "Cardio", status: "overused",
      photos: ["eq/eq11-assault-bike-1.jpg"],
      lastMaint: "2026-07-30", uses: 48, updatedAt: "2026-10-15T18:05:00Z",
      report: {
        reason: "It is the most popular cardio machine on the floor and the chain is loosening.",
        reportedIssue: "A member reported a clunk at the bottom of each stroke.",
        reportedAt: "2026-10-15",
        expectedBack: "2026-10-24",
        safety: "Turn the resistance down if you hear the clunk, and tell the floor team if it continues.",
        nextAction: "The chain and belt are being replaced on the next service visit.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq12", name: "Air bike", zone: "Cardio", status: "usable",
      photos: ["eq/eq12-air-bike-1.jpg"],
      lastMaint: "2026-10-01", uses: 9, updatedAt: "2026-10-13T09:40:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq13", name: "Stair climber", zone: "Cardio", status: "maintenance",
      photos: ["eq/eq13-stair-climber-1.jpg", "eq/eq13-stair-climber-2.jpg"],
      lastMaint: "2026-10-08", uses: 0, updatedAt: "2026-10-12T11:15:00Z",
      report: {
        reason: "The steps are being cleaned and the resistance mechanism is being serviced.",
        reportedIssue: "A step was catching as it came down at a high setting.",
        reportedAt: "2026-10-08",
        expectedBack: "2026-10-20",
        safety: "Please do not use this machine until the service is finished.",
        nextAction: "The mechanism is being checked before the machine returns to the floor.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq21", name: "Battle ropes", zone: "Cardio", status: "overused",
      photos: ["eq/eq21-battle-ropes-1.jpg", "eq/eq21-battle-ropes-2.jpg", "eq/eq21-battle-ropes-3.jpg"],
      lastMaint: "2026-09-05", uses: 37, updatedAt: "2026-10-14T19:00:00Z",
      report: {
        reason: "They are heavily used in the evening classes and the ends are fraying.",
        reportedIssue: "A member reported a rough spot near the anchor point.",
        reportedAt: "2026-10-14",
        expectedBack: "2026-10-26",
        safety: "Avoid the frayed section and do not swing the rope outside the marked area.",
        nextAction: "New ropes have been ordered and the anchors are being checked.",
        responsible: "Maintenance team"
      }
    },

    /* ---------------- weights ---------------- */
    {
      id: "eq3", name: "Dumbbell Rack A", zone: "Weights", status: "usable",
      photos: ["eq/eq3-dumbbell-rack-1.jpg", "eq/eq3-dumbbell-rack-2.jpg", "eq/eq3-dumbbell-rack-3.jpg"],
      lastMaint: "2026-10-02", uses: 8, updatedAt: "2026-10-13T11:05:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this rack.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq4", name: "Bench press", zone: "Weights", status: "maintenance",
      photos: ["eq/eq4-bench-press-1.jpg", "eq/eq4-bench-press-2.jpg"],
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
      id: "eq15", name: "Flat bench", zone: "Weights", status: "usable",
      photos: ["eq/eq15-flat-bench-1.jpg"],
      lastMaint: "2026-09-22", uses: 26, updatedAt: "2026-10-13T12:30:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this bench.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq16", name: "Trap bar", zone: "Weights", status: "usable",
      photos: ["eq/eq16-trap-bar-1.jpg", "eq/eq16-trap-bar-2.jpg"],
      lastMaint: "2026-09-11", uses: 14, updatedAt: "2026-10-11T14:20:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this bar.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq17", name: "Preacher curl bench", zone: "Weights", status: "usable",
      photos: ["eq/eq17-preacher-curl-1.jpg"],
      lastMaint: "2026-08-30", uses: 7, updatedAt: "2026-10-10T09:45:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this bench.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq18", name: "Dip station", zone: "Weights", status: "faulty",
      photos: ["eq/eq18-dip-station-1.jpg", "eq/eq18-dip-station-2.jpg"],
      lastMaint: "2026-07-14", uses: 0, updatedAt: "2026-10-12T16:00:00Z",
      report: {
        reason: "One of the uprights is worn and the welds are being inspected.",
        reportedIssue: "A member reported that the left handle moved under load.",
        reportedAt: "2026-10-12",
        expectedBack: "",
        safety: "Out of service. Please do not use the dip station and tell the floor team if you see any further movement.",
        nextAction: "The uprights are being checked and the handles replaced if needed. No return date has been confirmed yet.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq19", name: "Kettlebell set", zone: "Weights", status: "usable",
      photos: ["eq/eq19-kettlebells-1.jpg", "eq/eq19-kettlebells-2.jpg", "eq/eq19-kettlebells-3.jpg"],
      lastMaint: "2026-09-25", uses: 19, updatedAt: "2026-10-14T07:30:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this set.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq20", name: "Plyometric box", zone: "Weights", status: "usable",
      photos: ["eq/eq20-plyo-box-1.jpg"],
      lastMaint: "2026-10-04", uses: 11, updatedAt: "2026-10-12T13:15:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this box. Please return it to the wall after use.",
        nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq27", name: "Suspension trainer", zone: "Weights", status: "usable",
      photos: ["eq/eq27-suspension-1.jpg"],
      lastMaint: "2026-09-15", uses: 16, updatedAt: "2026-10-13T15:50:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this trainer. Check the anchor point is tight before you start.",
        nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },

    /* ---------------- machines ---------------- */
    {
      id: "eq5", name: "Lat pulldown", zone: "Machines", status: "faulty",
      photos: ["eq/eq5-lat-pulldown-1.jpg"],
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
      photos: ["eq/eq6-leg-press-1.jpg"],
      lastMaint: "2026-10-05", uses: 20, updatedAt: "2026-10-14T10:00:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq8", name: "Cable Crossover", zone: "Machines", status: "maintenance",
      photos: ["eq/eq8-cable-crossover-1.jpg"],
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
    },
    {
      id: "eq22", name: "Leg curl machine", zone: "Machines", status: "usable",
      photos: ["eq/eq22-leg-curl-1.jpg"],
      lastMaint: "2026-09-27", uses: 13, updatedAt: "2026-10-13T11:55:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq23", name: "Leg extension machine", zone: "Machines", status: "usable",
      photos: ["eq/eq23-leg-extension-1.jpg"],
      lastMaint: "2026-09-30", uses: 17, updatedAt: "2026-10-13T12:20:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq24", name: "Shoulder press machine", zone: "Machines", status: "maintenance",
      photos: ["eq/eq24-shoulder-press-1.jpg"],
      lastMaint: "2026-10-09", uses: 0, updatedAt: "2026-10-12T14:05:00Z",
      report: {
        reason: "The seat height is being adjusted and the handles are being replaced.",
        reportedIssue: "The handles turned slightly in the grip during a heavy press.",
        reportedAt: "2026-10-09",
        expectedBack: "2026-10-19",
        safety: "Please do not use this machine until the handles are fitted.",
        nextAction: "New handles are being fitted and the machine will be tested before it returns.",
        responsible: "Maintenance team"
      }
    },
    {
      id: "eq25", name: "Cable machine", zone: "Machines", status: "usable",
      photos: ["eq/eq25-cable-machine-1.jpg"],
      lastMaint: "2026-10-03", uses: 24, updatedAt: "2026-10-14T09:50:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine. Check the attachment is seated before you pull.",
        nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    },
    {
      id: "eq26", name: "Chest press machine", zone: "Machines", status: "usable",
      photos: ["eq/eq26-chest-press-1.jpg", "eq/eq26-chest-press-2.jpg"],
      lastMaint: "2026-09-18", uses: 21, updatedAt: "2026-10-12T16:35:00Z",
      report: {
        reason: "", reportedIssue: "", reportedAt: "", expectedBack: "",
        safety: "No safety notice for this machine.", nextAction: "No action needed.",
        responsible: "Gym floor team"
      }
    }
  ];

  D.equipment = EQUIPMENT;
  D.equipmentZones = ["Cardio", "Weights", "Machines"];
})(typeof window !== "undefined" ? window : this);
