---
layout: post
title:  "Boids of a Feather, Flock Together"
date:   2014-08-02 11:33:54
categories: graphics
---

Last weekend, I decided to revisit a book on animation techniques, one that I hadn't thought about in years. This is the excellent AdvancED Actionscript 3.0 Animation by Keith Peters. There's a much more basic cousin of this book, called Foundation Actionscript 3.0 Animation, which had temporarily become my only true love during my early years in college. It taught me how to simulate velocity, acceleration, gravity, easing, springing and some basic 3D. Keith Peters words his explanations of complex ideas really well, perfect for beginners like me trying to venture into the field. However, Flash appeared to fade away from the web, and with it my interest in Actionscript.

I recently began experimenting with a fantastic canvas rendering library called Paper.js. Seeing how Actionscript and Javascript are like fraternal twins, I decided to turn to Keith Peters once again, this time for some of the more advanced techniques.

And that's how I met Boids. Back in 1987 a computer programmer called Craig Reynolds developed a model for simulating co-ordinated animal behaviour like the movement of birds in flocks, that of sheep in herds or of fish in schools. He did this by decomposing the compound flocking behaviour of each animal in the group, to a collection of 3 simple behaviours.


