"use strict";

global.requestAnimationFrame = cb => setTimeout(cb, 0);
