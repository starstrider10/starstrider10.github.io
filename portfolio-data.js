// Curated visual studies from existing assets. These are not client case studies.
// Add approved objectives, deliverables and credits here before presenting commissioned work.
// A film can use `video: { src, poster, captions }` with local, cleared media files.
const portfolioProjects = [
  {
    id: 'spring-portraits', category: 'portraits', label: 'Portraits / Existing gallery selection',
    title: 'A portrait of spring.',
    summary: 'A selection of portraits from the existing Sakura gallery. People and place, held in the same frame.',
    approach: 'Seasonal colour, natural surroundings and space for the person within the landscape.',
    delivery: 'Photographic selection. Session objective and original delivery details to be supplied.',
    images: [
      { src: 'https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776367252/20250331-LEO05614-anabel_tzhkoc.jpg', alt: 'Portrait from the existing spring Sakura series' },
      { src: 'https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1000/v1776367253/20250404-LEO06204-sandy_h7d3uu.jpg', alt: 'Second portrait from the existing Sakura series' }
    ],
    link: 'gallery.html?filter=sakura', linkLabel: 'View the Sakura series'
  },
  {
    id: 'outdoor-portraits', category: 'portraits', label: 'Portraits / Outdoor study',
    title: 'Out here, as you are.',
    summary: 'Portrait photographs from the existing expedition photo folder. A human presence against open, rugged surroundings.',
    approach: 'Environmental framing and natural light, with the landscape as part of the portrait.',
    delivery: 'Three existing photographs. Original brief and delivery details to be supplied.',
    images: [
      { src: 'assets/expedition-portrait-1440.webp', alt: 'Outdoor portrait of a person seated on rock in an alpine landscape' },
      { src: 'assets/expedition-landscape-1440.webp', alt: 'Environmental portrait from the expedition photo selection' },
      { src: 'assets/expedition-detail-1440.webp', alt: 'Another portrait from the expedition photo selection' }
    ]
  },
  {
    id: 'life-outdoors', category: 'events', label: 'Lifestyle / Personal outdoor photography',
    title: 'Life beyond the everyday.',
    summary: 'A personal outdoor selection from the existing Gallery. These photographs show a sense of place; they are not presented as commissioned event coverage.',
    approach: 'Landscape, movement and scale — a visual reference for outdoor lifestyle stories.',
    delivery: 'Existing gallery photographs. An event case study and its actual deliverables still need to be supplied.',
    images: [
      { src: 'https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1600/v1776373117/20250426-LEO07497-ruth_final_stretch_mt_wontli.jpg', alt: 'Alpine ascent from the existing Mt. Ruth photography series' }
    ],
    link: 'gallery.html?filter=outdoors', linkLabel: 'Explore the outdoor archive',
    note: 'Local review note: add an approved event project, brief and delivered image set before publication.'
  },
  {
    id: 'short-form', category: 'content', label: 'Short-Form / Personal film · approximately 1 minute',
    title: 'A minute of storytelling.',
    summary: '“I’m a UW Student trapped in a productivity cult. So I learned a useless skill.” A personal film by Leo Fan, selected by Leo as a short introduction to his filmmaking.',
    approach: 'Personal storytelling in a concise film format. Additional production notes and role credits can be added here.',
    delivery: 'One existing YouTube film, approximately one minute as described by Leo. Additional vertical reels can be added as they are ready.',
    images: [], youtube: '1FaijuGNto0', youtubeEmbed: false,
    link: 'https://www.instagram.com/leo.inframe/', linkLabel: 'Visit leo.inframe',
    note: 'Local review note: YouTube embedding reported unavailable in local browser checks, so this film opens on YouTube. Confirm production credits, music/footage permissions and captions before publication. Add two or three finished vertical short-form pieces when ready.'
  }
];
