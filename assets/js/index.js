document.firstElementChild.classList.remove('no-js');
document.firstElementChild.classList.add('js');

const textWrappers = document.querySelectorAll('.text');
const info         = document.querySelectorAll('.text__ani');
const marks        = document.querySelectorAll('.text__ani__start');
let thisClass;
const shortDelay    = 100;
const longDelay     = 100;


function textAni() {
  for(let k = 0; k < marks.length; k++) {
    thisClass = 'text__ani__start';
    revealText(k, marks, thisClass, longDelay);
  }

  if(window.innerWidth < 800) { //mobile
    setTimeout(() => {
      for (let i = 0; i < info.length; i++) {
        const thisClass = 'text__ani';
        revealText(i, info, thisClass, shortDelay);
      }
    }, 1000);


  } else { // desktop
    setTimeout(() => {
      for (let i = 0; i < textWrappers.length; i++) {
        const elText = textWrappers[i].querySelectorAll('.text__ani');
        (() => {
          for (let j = 0; j < elText.length; j++) {
            (() => {
              setTimeout(() => {
                elText[j].classList.remove('text__ani');
              }, j * longDelay);
            })(j);
          }
        })(i);
      }
    }, 1000);

  }
}

textAni();


function revealText(i, el, thisClass, ms) {
  setTimeout(() => {
    el[i].classList.remove(thisClass);
    // console.log(i);
  }, ms * i);
}


function setCaptionHeight(captions) {
    let processedCount = 0;
    const captionHeightObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Perform the height calculation for each entry.
        entry.target.style.setProperty(
          '--caption-open-height',
          `${entry.target.childNodes[1].offsetHeight + 16}px`
        );
        // Unobserve the entry after processing it to prevent repeated calls.
        captionHeightObserver.unobserve(entry.target);
        processedCount += 1;

        // Check if all captions have been processed.
        if (processedCount === captions.length) {
           // set desc height to 0, so additional caption appears directly under title
          for(const caption of captions) {
            caption.style.setProperty('--caption-desc-height','0px');
          }
        }
      }
    });

    // Observe each caption element.
    for (const caption of captions) {
      captionHeightObserver.observe(caption);
    }
}

/// LAYOUT PROJECTS
document.addEventListener("DOMContentLoaded", async () => {
  ResponsiveVideoLoader.initAll();
  const captions = document.querySelectorAll('[data-caption]');
  setCaptionHeight(captions);

  updateProjectCounts();
  await updateProjectVisibility();

  const projects = document.querySelectorAll('[data-project]');
  for(const project of projects){
    observerProject.observe(project);
  }
});




// Modified image loading code
const loadImageWithTransition = (entry) => {
    const picture = entry.target.querySelector('picture');
    if (!picture) return;

    const img = picture.querySelector('img');
    const sources = picture.querySelectorAll('source');
    const elVw = Math.floor((picture.getBoundingClientRect().width / window.innerWidth) * 100);

    // Get the current placeholder image
    const placeholderSrc = img.src;

    // Set the placeholder as background image
    picture.style.backgroundImage = `url(${placeholderSrc})`;
    picture.classList.add('smooth-image');

    // Function to handle image loading
    const handleLoad = () => {
        img.classList.add('loaded');
    };

    // Set up the new image
    img.addEventListener('load', handleLoad);
    img.setAttribute('src', img.dataset.src);

    // Update sources
    for(const source of sources) {
      source.setAttribute('sizes', `(max-width: 640px) 100vw, ${elVw}vw`);
      source.setAttribute('srcset', source.dataset.srcset);
    }

};


const observerProject = new IntersectionObserver((entries) => {
    for(const entry of entries) {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            // entry.target.classList.remove('loading');
            loadImageWithTransition(entry);

            const videoEl = document.querySelector('video');

            if(videoEl && !entry.target.classList.contains('faded')) {
              videoEl.play();
            }

            observerProject.unobserve(entry.target);

        }
    }
}, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
});

async function updateProjectVisibility(currentProject) {
    const urlParams = new URLSearchParams(window.location.search);
    const isolate = urlParams.get('project');
    const projects = document.querySelectorAll('[data-project]');



    if (!isolate) {
        // If no project is specified in the URL, show all projects
        for(const project of projects ) {
          const video = project.querySelector('video');

          project.classList.remove('faded');
          project.classList.remove('isolated');
          project.classList.remove('show--description');

          if(video) {
              video.play();
          }
        }
    } else {
        // Apply fading based on the project ID in the URL
        for (const project of projects) {
            const video = project.querySelector('video');

            if (project.dataset.project !== isolate) {
                project.classList.add('faded');
                project.classList.remove('isolated');

                if(video) {
                    video.pause();
                }

            } else {
                project.classList.remove('faded');
                project.classList.add('isolated');
                if(video) {
                    video.play();
                }
            }
            if(project === currentProject) {
                project.classList.add('show--description');
            } else {
                project.classList.remove('show--description');
            }
        }

    }
    if(!currentProject && isolate) {
      const parent =  document.querySelector(`[data-project="${isolate}"]`);
      parent.scrollIntoView({behavior: "instant", block: "center", inline: "center"});
      parent.classList.add('show--description');


  }
}

function updateURL(projectId) {
    const url = new URL(window.location);
    if (projectId) {
        url.searchParams.set('project', projectId);
    } else {
        url.searchParams.delete('project');
    }
    history.replaceState(null, '', url);
}



document.addEventListener('click', (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentProject = urlParams.get('project');

  // If there's a current isolated project
  if (currentProject) {
    // console.log(currentProject)
    // Check if the clicked element or any of its parents have a project-id
    const clickedProjectElement = event.target.closest(`[data-project=${currentProject}]`);

    // If no project element is found or its project-id doesn't match the current isolated project
    if (!clickedProjectElement || clickedProjectElement.dataset.project !== currentProject) {
      updateURL(null);
      updateProjectVisibility(null);
    }
  }
}, true);

const projects = document.querySelectorAll('[data-project]');

// Eventlistner to add isolation function
for(const project of projects) {
  project.addEventListener('click', () => {
    const isolate = project.dataset.project;
    const urlParams = new URLSearchParams(window.location.search);
    const currentProject = urlParams.get('project');
    const projectCaptionDesc = project.querySelector('[data-caption-desc]');


    // projectCaptionDesc.style.height = 'auto';

    if (currentProject === isolate) {
        projectCaptionDesc.style.setProperty('--caption-desc-height', '0px');
        updateURL(null);
    } else {
        projectCaptionDesc.style.setProperty('--caption-desc-height', 'auto');
        updateURL(isolate);
    }
    updateProjectVisibility(project);
  });
}


function updateProjectCounts() {
    // Get all elements with data-isolate-project attribute
    const projectElements = document.querySelectorAll('[data-isolate-project]');

    // Create an object to store project counts
    const projectCounts = {};

    // Count occurrences of each project
    for(const el of projectElements) {
      const projectName = el.getAttribute('data-isolate-project');
      projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
    }
    // Update the count for each element
    for(const el of projectElements) {
        const projectName = el.getAttribute('data-isolate-project');
        const totalCount = projectCounts[projectName];
        const currentIndex = [...projectElements].filter(e => e.getAttribute('data-isolate-project') === projectName).indexOf(el) + 1;

        const countElement = el.querySelector('.caption__right__count');
        if (countElement) {
          countElement.textContent = `${currentIndex} / ${totalCount}`;
        }
    }
}


class ResponsiveVideoLoader {
  constructor(containerElement) {
    this.container = containerElement;
    this.resolutions = this.parseResolutions();
    this.placeholder = this.container.querySelector('img');
    this.videoWidth = Number.parseInt(this.container.dataset.width || '0');
    this.videoHeight = Number.parseInt(this.container.dataset.height || '0');
    this.init();
  }

  parseResolutions() {
    const resolutionsAttr = this.container.dataset.resolutions;
    return resolutionsAttr
      ? resolutionsAttr.split(',').map(res => res.trim())
      : [];
  }

  extractResolution(filename) {
    // Matches any filename ending with _[resolution]p.mp4
    const match = filename.match(/_(\d+)p\.mp4$/);
    return match ? Number.parseInt(match[1]) : 0;
  }

  calculateVideoAspectRatio() {
    if (this.videoWidth <= 0 || this.videoHeight <= 0) {
      return 1; // Default to 1:1 if no valid dimensions
    }
    return this.videoHeight / this.videoWidth;
  }

  calcHeight(width) {
    // height=width×aspect ratio
    const aspectRatio = this.calculateVideoAspectRatio();
    return width * aspectRatio;
  }

  getLongest(height, width) {
    return height > width ? height : width;
  }

  findIdealResolution(parsedResolutions, containerLongest, dpr) {
    const target = containerLongest * dpr;

    // Find the object with the closest "longest" value to the target
    const idealResolution = parsedResolutions.reduce((closest, current) => {
    // console.log(target, current.longest);
        const currentComparedToTarget = Math.abs(current.longest - target);
        const closestComparedToTarget = Math.abs(closest.longest - target);
        // if(current.filename.includes('phone_product_scroll')) {
        //   console.log('current', current, 'closest', closest, 't', target, 'c', containerLongest, 'dpr', dpr);
        //   // console.log('cl', current.longest, 't', target, 'currentComparedToTarget',currentComparedToTarget,  'closestComparedToTarget', closestComparedToTarget);
        // }

        return currentComparedToTarget < closestComparedToTarget ? current : closest;
    });

    // if(idealResolution.filename.includes('phone_product_scroll')) {
    //   console.log('idealResolution', idealResolution);
    // }
    return idealResolution;
  }

  getIdealResolution() {
    // Device pixel ratio helps with high DPI screens
    const dpr = window.devicePixelRatio || 1;

    // Get container dimensions
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    const containerLongest = this.getLongest(containerHeight, containerWidth);

    // Extract and sort resolutions
    const parsedResolutions = this.resolutions
      .map(res => {
        const resolution = this.extractResolution(res);
        const height = this.calcHeight(resolution);
        const longest = this.getLongest(height, resolution);
        return {
          filename: res,
          resolution: resolution,
          width: resolution,
          height: height,
          longest: longest,
        };
      })
      .sort((a, b) => a.resolution - b.resolution);

    // If no valid resolutions, log and return
    if (parsedResolutions.length === 0) {
      console.error('No valid video resolutions found');
      return null;
    }

    const idealResolution = this.findIdealResolution(parsedResolutions, containerLongest, dpr);
    // Fallback logic:
    // 1. If no resolution fits, use the highest available
    // 2. If no resolution found, use the highest
    return (idealResolution || parsedResolutions[parsedResolutions.length - 1]).resolution;
  }

  createVideoElement(resolution) {
    // If no resolution was calculated, use the highest available
    if (resolution === null) {
      const resolutions = this.resolutions
        .map(res => this.extractResolution(res))
        .filter(res => res > 0);

      resolution = Math.max(...resolutions);
    }

    // Find the first video that matches the resolution
    const videoSrc = this.resolutions.find(res =>
      this.extractResolution(res) === resolution
    );

    if (!videoSrc) {
      console.error(`No video found for resolution ${resolution}p`);
      return null;
    }

    const video = document.createElement('video');
    video.src = videoSrc;
    video.poster = this.placeholder.src;

    // Copy original classes
    video.className = this.container.className;

    // Set aspect ratio CSS variable
    if (this.videoWidth > 0 && this.videoHeight > 0) {
      video.style.setProperty('--_aspect-ratio', `${this.videoWidth} / ${this.videoHeight}`);
    }

    // Apply additional attributes from data-attributes
    const additionalAttributes = (this.container.dataset.attributes || '').split(',')
      .map(attr => attr.trim().toLowerCase())
      .filter(attr => attr);

    // Specifically handle controls, muted, playsinline, and autoplay
    if (additionalAttributes.includes('controls')) {
      video.controls = true;
    }

    if (additionalAttributes.includes('muted')) {
      video.muted = true;
    }

    if (additionalAttributes.includes('playsinline')) {
      video.setAttribute('playsinline', '');
    }

    if (additionalAttributes.includes('autoplay')) {
      video.autoplay = true;
    }
    if (additionalAttributes.includes('loop')) {
      video.loop = true;
    }

    // Set preload attribute if specified
    const preload = this.container.dataset.preload;
    if (preload) {
      video.preload = preload;
    }

    // Copy attributes from img to video
    for(const attr of Array.from(this.placeholder.attributes)) {
      if (attr.name !== 'src') {
        video.setAttribute(attr.name, attr.value);
      }
    }
    return video;
  }

  init() {
    this.loadOptimalVideo();
  }

  loadOptimalVideo() {
    const idealResolution = this.getIdealResolution();
    const videoElement = this.createVideoElement(idealResolution);

    if (videoElement) {
      // Replace placeholder or existing video
      if (this.placeholder) {
        this.placeholder.replaceWith(videoElement);
      } else {
        this.container.appendChild(videoElement);
      }
    }
  }

  // Static method to initialize all responsive video containers
  static initAll(selector = '[data-resolutions]') {
    for(const container of document.querySelectorAll(selector)) {
      new ResponsiveVideoLoader(container);
    }
  }
}
