// ponytail: curated content lives here; compact entries put media first.
// Image dimensions preserve framing; add responsive -480/-960/-1440.webp siblings.
const portfolioProjects = [
  {
    "id": "nicole",
    "category": "portraits",
    "title": "Nicole",
    "cover": {
      "src": "assets/portrait-projects/nicole-wide-walk.jpg",
      "alt": "Nicole walking away along a path beside tall reeds",
      "width": 1280,
      "height": 720
    },
    "sequence": [
      {
        "clip": "assets/portrait-projects/nicole-wide-walk.mp4",
        "poster": "assets/portrait-projects/nicole-wide-walk.jpg",
        "label": "Nicole walking away along the path"
      },
      1,
      {
        "clip": "assets/portrait-projects/nicole-close-turn.mp4",
        "poster": "assets/portrait-projects/nicole-close-turn.jpg",
        "label": "Nicole turns away in a closer view"
      },
      0
    ],
    "images": [
      {
        "src": "assets/portrait-projects/nicole-dscf4643-1440.webp",
        "alt": "Nicole looks back over her shoulder beside tall reeds",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/portrait-projects/nicole-dscf4656-1440.webp",
        "alt": "Nicole faces the camera by a creek framed by autumn trees",
        "width": 1440,
        "height": 960
      }
    ]
  },
  {
    "id": "christie",
    "category": "portraits",
    "title": "Christie",
    "coverIndex": 1,
    "background": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1600/v1776312209/20260331-LEO02409-christie_b9fuye.jpg",
    "images": [
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776312213/20260331-LEO02645-christie_ynp7ql.jpg",
        "alt": "Christie — portrait 1",
        "width": 1200,
        "height": 1796
      },
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776312211/20260331-LEO02454-christie_vpilnj.jpg",
        "alt": "Christie in graduation robes on a path beneath cherry blossoms",
        "width": 1200,
        "height": 1796
      },
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776312210/20260331-LEO02435-christie_b1utmx.jpg",
        "alt": "Christie — portrait 3",
        "width": 1200,
        "height": 1796
      },
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776312209/20260331-LEO02409-christie_b9fuye.jpg",
        "alt": "Christie in profile on the lawn beneath cherry blossoms",
        "width": 1200,
        "height": 800
      },
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776312207/20260331-LEO02395-christie_wrauru.jpg",
        "alt": "Christie — portrait 5",
        "width": 1200,
        "height": 1796
      }
    ]
  },
  {
    "id": "isabella",
    "category": "portraits",
    "title": "Isabella",
    "coverIndex": 2,
    "images": [
      {
        "src": "assets/portrait-projects/isabella-bbb04965-1440.webp",
        "alt": "Isabella — portrait 1",
        "width": 1440,
        "height": 2161
      },
      {
        "src": "assets/portrait-projects/isabella-dscf4527-1440.webp",
        "alt": "Isabella — portrait 2",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/portrait-projects/isabella-bbb05093-1440.webp",
        "alt": "Isabella — portrait 3",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/portrait-projects/isabella-dscf4551-1440.webp",
        "alt": "Isabella — portrait 4",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/portrait-projects/isabella-bbb05185-1440.webp",
        "alt": "Isabella — portrait 5",
        "width": 1440,
        "height": 2161
      },
      {
        "src": "assets/portrait-projects/isabella-bbb05198-1440.webp",
        "alt": "Isabella — portrait 6",
        "width": 1440,
        "height": 960
      }
    ],
    "background": "assets/portrait-projects/isabella-background-1600.webp"
  },
  {
    "id": "spring-portraits",
    "category": "portraits",
    "label": "Photo story / Sakura",
    "photoStory": true,
    "title": "A Portrait of Spring",
    "coverIndex": 2,
    "year": "2025",
    "summary": "Cherry blossoms connect a close portrait of Anabel to a wider sense of place.",
    "images": [
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776367252/20250331-LEO05614-anabel_tzhkoc.jpg",
        "alt": "Close portrait of Anabel with pale blossoms softly out of focus behind her",
        "width": 1200,
        "height": 800
      },
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776367251/20250331-LEO05535-anabel_ju8x6c.jpg",
        "alt": "Anabel sitting at the foot of a cherry tree beneath a broad canopy of blossoms",
        "width": 1200,
        "height": 800
      },
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776367251/20250331-LEO05491-anabel_dhtvvq.jpg",
        "alt": "Anabel seen from behind beneath backlit cherry blossoms",
        "width": 1200,
        "height": 800
      }
    ],
    "link": "gallery.html?filter=sakura",
    "linkLabel": "View the Sakura series"
  },
  {
    "id": "outdoor-portraits",
    "category": "archive",
    "label": "Portraits / Environmental storytelling",
    "imageLayout": "environmental-sequence",
    "title": "Environmental portraits.",
    "summary": "",
    "approach": "Environmental framing and natural light, with the landscape as part of the portrait.",
    "images": [
      {
        "src": "assets/environment-jingxi-1440.webp",
        "alt": "Portrait in warm window light, with patterned blinds filling the surrounding scene",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/expedition-portrait-1440.webp",
        "alt": "Kyle seated on rock in an alpine landscape",
        "width": 1333,
        "height": 2000
      },
      {
        "src": "assets/environment-lakeside-wide-1440.webp",
        "alt": "A person holding a camera beneath trees beside a lake",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/environment-lakeside-close-1440.webp",
        "alt": "Close portrait beside a sunlit lake, with mountains across the water",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/environment-vivian-1440.webp",
        "alt": "A person in a white skirt standing in a wide meadow",
        "width": 1440,
        "height": 962
      },
      {
        "src": "assets/environment-isabella-1440.webp",
        "alt": "Portrait framed by orange and red autumn leaves",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/environment-forest-1440.webp",
        "alt": "Leo standing on a forest path surrounded by green foliage",
        "width": 1440,
        "height": 962
      }
    ],
    "compact": true
  },
  {
    "id": "wiux-panel",
    "category": "events",
    "title": "Women in UX \u2014 UX Role Possibilities Panel",
    "coverIndex": 2,
    "coverIndices": [2, 4, 5],
    "images": [
      {
        "src": "assets/event-projects/wiux-panel-bbb06188-1440.webp",
        "alt": "Audience members frame a panel discussion beneath a career question",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06198-1440.webp",
        "alt": "Three organizers stand behind the lectern during the discussion",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06185-1440.webp",
        "alt": "A panelist gestures with both hands as another listens",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06246-1440.webp",
        "alt": "An attendee speaks from her seat during the discussion",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06220-1440.webp",
        "alt": "Panelists share a laugh during the conversation",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06252-1440.webp",
        "alt": "An organizer listens in the foreground with the panel behind her",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06300-1440.webp",
        "alt": "A panelist gestures during a conversation with attendees after the talk",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/wiux-panel-bbb06282-1440.webp",
        "alt": "Panelists and attendees gather for a celebratory group photograph",
        "width": 1440,
        "height": 960
      }
    ]
  },
  {
    "id": "women-in-ux",
    "category": "events",
    "title": "Women in UX",
    "coverIndex": 1,
    "coverIndices": [1, 2],
    "images": [
      {
        "src": "assets/event-projects/women-in-ux-bbb05368-1440.webp",
        "alt": "Wide view of the lecture room with the presentation projected at the front",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/women-in-ux-bbb05236-1440.webp",
        "alt": "Presenter in a blue beanie gestures beside the monitor",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/women-in-ux-bbb05300-1440.webp",
        "alt": "View of the audience from behind the presenter",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/women-in-ux-bbb05256-1440.webp",
        "alt": "An attendee listens with her hands clasped",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/women-in-ux-bbb05377-1440.webp",
        "alt": "Hands on a laptop keyboard beside a tumbler",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/women-in-ux-bbb05325-1440.webp",
        "alt": "Attendees smile as they talk at their desks",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/women-in-ux-bbb05293-1440.webp",
        "alt": "Six people pose together by the lecture room windows",
        "width": 1440,
        "height": 960
      }
    ]
  },
  {
    "id": "figma-event",
    "category": "events",
    "title": "Figma event",
    "coverIndex": 4,
    "coverIndices": [4, 3, 8],
    "images": [
      {
        "src": "assets/event-projects/figma-event-bbb05908-1440.webp",
        "alt": "Wide view of the room and rows of workshop tables",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb05990-1440.webp",
        "alt": "A facilitator leans over a table to speak with participants",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb05950-1440.webp",
        "alt": "Hands work with a stylus on a tablet beside colorful pieces",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb05973-1440.webp",
        "alt": "Participants lean toward a laptop at a shared table",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb05969-1440.webp",
        "alt": "A participant laughs beside an open laptop",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb05865-1440.webp",
        "alt": "Side portrait of a smiling attendee wearing colorful hair clips",
        "width": 1440,
        "height": 2160
      },
      {
        "src": "assets/event-projects/figma-event-bbb06012-1440.webp",
        "alt": "Three attendees pose as another person takes their photo",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb05838-1440.webp",
        "alt": "Attendees look off frame in purple light",
        "width": 1440,
        "height": 960
      },
      {
        "src": "assets/event-projects/figma-event-bbb06094-1440.webp",
        "alt": "Group poses behind a table, holding up colorful pieces",
        "width": 1440,
        "height": 960
      }
    ]
  },
  {
    "id": "life-outdoors",
    "category": "adventures",
    "label": "Lifestyle / Personal outdoor photography",
    "title": "Life beyond the everyday.",
    "summary": "A personal outdoor series: alpine landscape, movement and a sense of scale.",
    "approach": "Landscape, movement and scale — a visual reference for outdoor lifestyle stories.",
    "images": [
      {
        "src": "https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1600/v1776373117/20250426-LEO07497-ruth_final_stretch_mt_wontli.jpg",
        "alt": "Alpine ascent from the existing Mt. Ruth photography series"
      }
    ],
    "link": "gallery.html?filter=outdoors",
    "linkLabel": "Explore the outdoor archive",
    "reviewNote": "Local review note: add an approved event project, brief and delivered image set before publication."
  },
  {
    "id": "the-life-i-promised",
    "category": "content",
    "label": "Featured short film / Two Lives, Part 2",
    "title": "The Life I Promised Myself",
    "summary": "What happens when you come face to face with the life you once promised yourself?",
    "images": [],
    "instagramUrl": "https://www.instagram.com/reel/Dffx2Dqv0LU/",
    "video": {
      "src": "assets/video/life-i-promised.mp4",
      "preview": "assets/video/life-i-promised-preview.mp4",
      "poster": "assets/life-i-promised-poster.jpg",
      "width": 720,
      "height": 1280
    }
  },
  {
    "id": "rest-vs-rot",
    "category": "content",
    "label": "Short film",
    "title": "Rest vs Rot",
    "summary": "",
    "images": [],
    "format": "vertical",
    "compact": true,
    "video": {
      "src": "assets/video/rest-vs-rot.mp4",
      "preview": "assets/video/rest-vs-rot-preview.mp4",
      "poster": "assets/rest-vs-rot-poster.jpg",
      "width": 720,
      "height": 1280
    },
    "instagramUrl": "https://www.instagram.com/reel/DfTzJmFyTFp/"
  },
  {
    "id": "full-moon",
    "category": "content",
    "label": "Short film",
    "title": "Full Moon",
    "summary": "",
    "images": [],
    "format": "vertical",
    "compact": true,
    "video": {
      "src": "assets/video/full-moon.mp4",
      "preview": "assets/video/full-moon-preview.mp4",
      "poster": "assets/full-moon-poster.jpg",
      "width": 720,
      "height": 1280
    },
    "instagramUrl": "https://www.instagram.com/reels/DUQ9rljDwyA/"
  },
  {
    "id": "made-of-stars",
    "category": "content",
    "label": "Short-Form / Reflective story",
    "title": "Made of Stars",
    "summary": "A reflective short about how we are made of stars.",
    "approach": "A personal reflection told in a short-form video.",
    "delivery": "One vertical Reel, published on Instagram.",
    "credits": [
      "Direction",
      "Filming",
      "Editing",
      "Color"
    ],
    "images": [],
    "format": "vertical",
    "video": {
      "src": "https://res.cloudinary.com/decv98oqz/video/upload/v1793340569/Video-6606_fhpgfa.mp4",
      "preview": "assets/video/made-of-stars-preview.mp4",
      "poster": "assets/made-of-stars-poster.jpg",
      "width": 720,
      "height": 1280
    },
    "instagramUrl": "https://www.instagram.com/reel/Des13xtSB4X/",
    "titleNote": "Descriptive working title.",
    "compact": true
  },
  {
    "id": "short-form",
    "category": "content",
    "label": "Short-Form / Personal film · approximately 1 minute",
    "title": "A minute of storytelling.",
    "summary": "“I’m a UW Student trapped in a productivity cult. So I learned a useless skill.” A personal film by Leo Fan, selected by Leo as a short introduction to his filmmaking.",
    "approach": "Personal storytelling in a concise film format.",
    "delivery": "One personal YouTube film, approximately one minute as described by Leo.",
    "images": [],
    "youtube": "1FaijuGNto0",
    "preview": {
      "src": "assets/video/minute-of-storytelling-preview.mp4",
      "poster": "assets/minute-of-storytelling-poster.jpg",
      "width": 854,
      "height": 480
    },
    "youtubeEmbed": false,
    "link": "https://www.instagram.com/leo.inframe/",
    "linkLabel": "Visit leo.inframe",
    "reviewNote": "Local review note: YouTube embedding reported unavailable in local browser checks, so this film opens on YouTube. Confirm production credits, music/footage permissions and captions before publication.",
    "compact": true
  },
  {
    "id": "young-and-beautiful",
    "category": "content",
    "label": "Film / Music video",
    "title": "Young and Beautiful (Cover) M/V",
    "summary": "A full music video for a cover of “Young and Beautiful.”",
    "approach": "Direction, filming and post-production by Leo Fan.",
    "delivery": "One full music video, published on YouTube as “leos - Young and Beautiful (Cover) M/V.”",
    "credits": [
      "Direction",
      "Filming",
      "Editing",
      "Color"
    ],
    "images": [],
    "youtube": "YpRT2H2vnTw",
    "preview": {
      "src": "assets/video/young-and-beautiful-preview.mp4",
      "poster": "assets/young-and-beautiful-poster.jpg",
      "width": 854,
      "height": 480
    },
    "youtubeEmbed": false,
    "compact": true
  }
];

// ponytail: explicit curation references existing projects; no duplicate media catalog.
const homeSelection = [
  {project: 'spring-portraits', image: 0},
  {project: 'the-life-i-promised'},
  {project: 'nicole', image: 0},
  {project: 'isabella', image: 0},
  {project: 'full-moon'},
  {project: 'spring-portraits', image: 1},
  {project: 'christie', image: 0},
  {project: 'rest-vs-rot'},
  {project: 'life-outdoors', image: 0},
  {project: 'isabella', image: 2},
  {project: 'made-of-stars'},
  {project: 'spring-portraits', image: 2}
];
