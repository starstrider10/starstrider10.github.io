// Selected photographs and films. Only confirmed project context and credits belong here.
// A film can use `video: { src, poster, captions }` with local, cleared media files.
const portfolioProjects = [
  {
    id: 'spring-portraits', category: 'portraits', label: 'Portraits / Spring & graduation selection',
    imageLayout: 'portrait-pair',
    title: 'A portrait of spring.',
    summary: 'Personal and graduation portraits in spring light. People and place, held in the same frame.',
    approach: 'Seasonal colour, natural surroundings and space for the person within the landscape.',
    images: [
      { src: 'https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1200/v1776367252/20250331-LEO05614-anabel_tzhkoc.jpg', alt: 'Portrait from the existing spring Sakura series' },
      { src: 'https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1000/v1776312213/20260331-LEO02645-christie_ynp7ql.jpg', alt: 'Close graduation portrait in natural light from the existing spring gallery' }
    ],
    link: 'gallery.html?filter=sakura', linkLabel: 'View the Sakura series'
  },
  {
    id: 'outdoor-portraits', category: 'portraits', label: 'Portraits / Outdoor study',
    imageLayout: 'single-portrait',
    title: 'Out here, as you are.',
    summary: 'An environmental portrait with a human presence against open, rugged surroundings.',
    approach: 'Environmental framing and natural light, with the landscape as part of the portrait.',
    images: [
      { src: 'assets/expedition-portrait-1440.webp', alt: 'Outdoor portrait of a person seated on rock in an alpine landscape' }
    ]
  },
  {
    id: 'life-outdoors', category: 'events', label: 'Lifestyle / Personal outdoor photography',
    title: 'Life beyond the everyday.',
    summary: 'A personal outdoor series: alpine landscape, movement and a sense of scale.',
    approach: 'Landscape, movement and scale — a visual reference for outdoor lifestyle stories.',
    images: [
      { src: 'https://res.cloudinary.com/decv98oqz/image/upload/f_auto,q_auto,w_1600/v1776373117/20250426-LEO07497-ruth_final_stretch_mt_wontli.jpg', alt: 'Alpine ascent from the existing Mt. Ruth photography series' }
    ],
    link: 'gallery.html?filter=outdoors', linkLabel: 'Explore the outdoor archive',
    reviewNote: 'Local review note: add an approved event project, brief and delivered image set before publication.'
  },
  {
    id: 'short-form', category: 'content', label: 'Short-Form / Personal film · approximately 1 minute',
    title: 'A minute of storytelling.',
    summary: '“I’m a UW Student trapped in a productivity cult. So I learned a useless skill.” A personal film by Leo Fan, selected by Leo as a short introduction to his filmmaking.',
    approach: 'Personal storytelling in a concise film format.',
    delivery: 'One personal YouTube film, approximately one minute as described by Leo.',
    images: [], youtube: '1FaijuGNto0', youtubeEmbed: false,
    link: 'https://www.instagram.com/leo.inframe/', linkLabel: 'Visit leo.inframe',
    reviewNote: 'Local review note: YouTube embedding reported unavailable in local browser checks, so this film opens on YouTube. Confirm production credits, music/footage permissions and captions before publication.'
  },
  {
    id: 'made-of-stars', category: 'content', label: 'Short-Form / Reflective story',
    title: 'Made of Stars',
    summary: 'A reflective short about how we are made of stars.',
    approach: 'A personal reflection told in a short-form video.',
    delivery: 'One vertical Reel, published on Instagram.',
    credits: ['Direction', 'Filming', 'Editing', 'Color'],
    images: [], format: 'vertical',
    video: {
      src: 'https://res.cloudinary.com/decv98oqz/video/upload/v1793340569/Video-6606_fhpgfa.mp4',
      poster: 'assets/made-of-stars-poster.jpg', width: 720, height: 1280
    },
    instagramUrl: 'https://www.instagram.com/reel/Des13xtSB4X/',
    titleNote: 'Descriptive working title.'
  },
  {
    id: 'music-video-promo', category: 'content', label: 'Short-Form / Music-video promo',
    title: 'Music-video promo',
    summary: 'A short promotional piece for a music video.',
    approach: 'Music-video work presented in a short promotional format.',
    delivery: 'One music-video promo, also published on Instagram.',
    credits: ['Direction', 'Filming', 'Editing', 'Color'],
    images: [], format: 'landscape',
    video: {
      src: 'https://res.cloudinary.com/decv98oqz/video/upload/v1793340509/Video-73917_ubxwcy.mp4',
      poster: 'assets/music-video-promo-poster.jpg', width: 1276, height: 718
    },
    instagramUrl: 'https://www.instagram.com/reel/DbkTd0fsNxf/'
  },
  {
    id: 'young-and-beautiful', category: 'content', label: 'Film / Music video',
    title: 'Young and Beautiful (Cover) M/V',
    summary: 'A full music video for a cover of “Young and Beautiful.”',
    approach: 'Direction, filming and post-production by Leo Fan.',
    delivery: 'One full music video, published on YouTube as “leos - Young and Beautiful (Cover) M/V.”',
    credits: ['Direction', 'Filming', 'Editing', 'Color'],
    images: [], youtube: 'YpRT2H2vnTw', youtubeEmbed: false
  }
];
