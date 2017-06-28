Style Guide
===========

=CSS=
Scoped or not?  Check bundled output for a v-for loop rendering multiple child components with both scoped and not scoped style tags.

=Components=
Use single file components and keep them small
Use JSDoc syntax at the top of every script component

=File Structure=
For components, mirror the natural view hierarchy, so a page is a folder, categories of child components are sub-folders, and so on.
For logic, such as models and data transformations, separate folders:
    * models
    * transformations
    * apis

=Project Plan=
* Working time: 14:00 -> 17:00 CEST
* Schema: Metric configuration for UI
* Vertical Slice Decision: Active Editors, Pageviews, Unique Devices, Total Articles
* Schema: Metric query to the API
* URI Scheme for AQS, mock it return fake data for initial work?
* URI Scheme for front-end (how we make things bookmarkable)
* Decide how to implement the various widgets (like dashboard vs. detail ones, different visualizations, does it make sense together)
* Mechanical: implement all widgets
* Mechanical: reuse (by breaking up)? most of the dashboard and detail from prototype?
* Schema: Site configuration objects: personal preferences, saved wiki selection, etc., default site config, etc.
* Mechanical: CSS structure
* Internationalization: simple layer of abstraction on top of raw text


##Wikistats 2 Frontend

**To build the dev bundle and watch file changes**

```
npm run dev
```

**To run tests, watching file changes**

```
npm test
```
