# raghavgoel.in

**Live:** [raghavgoel.in](https://raghavgoel.in)

<!-- demo clip: add docs/demo.gif (5–10 s of the drop-in and a rail ride) and uncomment
![The skater drops onto the rail and rides to the projects](docs/demo.gif)
-->

This is my portfolio, and you don't scroll through it so much as ride it. A skater rolls in, writes my name on the way past, drifts to a stop and drops onto the scrollbar. From there you can grab the skater and grind through my work, one checkpoint at a time, to a course-clear finish.

## Why a skate run

Skating is where I come from. It was my childhood, long before I wrote any code, and I wanted the place that
introduces me to feel like me, not like a template with my name swapped in.

<!-- your story: a line or two about where and what you skated, or a memory that stuck, goes here -->

So the whole site is a 90s skate zine. Paper, thick ink outlines, pink, acid yellow and blue, and type that looks
cut out and taped down. Projects are skate decks, each with its own cover art, that flip over to show what I built.
Skills are wheels, rated in durometer, the hardness scale skaters use: 99A is what I use every day, 92A is what I've
shipped, 84A is what I've built with. Experience is a run log, certificates are trading cards in a ring binder, and
the contact section is the finish line.

## Drawn in code, built with AI

My first attempt mixed assets from different places, and it never felt like one thing. This time I set one rule:
**every graphic is code.** The skater, the deck covers, the wheels, the binder, even the clouds and the favicon are
SVG and CSS, so everything shares one hand.

And this time I built it entirely with AI, using Claude Opus 5.5. I didn't write the code by hand: I brought the
vision and the intent, and Claude did the building. Every decision was mine: the zine look, how the skater should move, what each section should say
and every "no, not like that" along the way.

The skater is me, drawn from my own character sheet as layered SVG parts and posed by a small rig: joints, springs,
feet that stay planted, eyes that follow your pointer. No animation library, just one loop that runs the
choreography. Getting it to feel right took the most direction of anything here, and it's the part I'm proudest of:
a system with moving parts that has to feel effortless to the person using it.

## About me

I'm Raghav Goel, an AI software engineer. I build AI products end to end: agents that do real work inside a
product, like triaging requests, tracing a problem to its root cause and proposing the fix, and the systems around
them, from real-time updates and document generation to reporting. I like the whole path, from the model call to the
product around it to the infrastructure that keeps it up at 3am.

I'm open to software engineering, full-stack, AI engineering and forward-deployed roles.

- Site: [raghavgoel.in](https://raghavgoel.in)
- LinkedIn: [raghav-goel01](https://www.linkedin.com/in/raghav-goel01)
- X: [@raaaghavvvvv](https://x.com/raaaghavvvvv)
- Email: work.raghav01@gmail.com

## Under the hood

Next.js (static export), TypeScript, Lenis for smooth scrolling and plain CSS modules. Everything the page says lives
in `src/config`, the ride engine lives in `src/features/ride`, and the whole site ships as static files: it scores
99 / 100 / 100 / 100 on Lighthouse (desktop) and reads fully without JavaScript, for people and AI crawlers alike.

To run it: `npm install`, then `npm run dev` (Node 22+). How it's put together, and where to change things, is in
[docs/development.md](docs/development.md).

## License and credits

The source code is [MIT](LICENSE). The rider character and its art, the deck cover illustrations, the written content
and the site's visual design are © Raghav Goel, all rights reserved. Learn from the code, fork the engine, borrow the
binder, but please don't publish the site itself as your own.

- Issuer logos for Anthropic, Docker, Udemy and Wipro: [Simple Icons](https://simpleicons.org) (CC0). Company names
  and logos are trademarks of their owners.
- Bowlby One by Vernon Adams, [SIL Open Font License](src/assets/fonts/OFL-BowlbyOne.txt).
