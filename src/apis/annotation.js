/**
 * Retrieves pageview and unique devices counts from AQS.
 */
import config from '../config';
import _ from '../lodash-custom-bundle';
import utils from '../utils';
import { processRawAnnotations } from '../models/Annotations';

const MEDIAWIKI_RED_LINK_PAGE_ID = '-1';


function parseMediawikiDashikiFormat (data) {
    // could use mediawiki-storage for this but we haven't decided yet
    // how to store annotations long term,
    // so for now I just copied these three lines that do what we need
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === MEDIAWIKI_RED_LINK_PAGE_ID) { return []; }
    const annotations = JSON.parse(pages[pageId].revisions[0]['*']).annotations || [];

    annotations.sort((a, b) => a.date > b.date ? 1 : -1);
    return annotations.map(a => Object.assign(a, {
        date: new Date(a.date),
        label: a.note,
    }));
}

/*
 * Returns {Array<Object>}
 *  A list of annotations that are relevant to the metric passed in
 *  Annotations look like:
 *
 *  {
 *      note:               {String},
 *      title:              {String},
 *      date:               {Date},
 *      relevantBreakdowns: {Array<String>}
 *  }
 *
 * And the result array will be sorted by date
 *
 * Parameters
 *  url: where to fetch the annotations from
 *
 */
function fetchAnnotations (url) {

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            dataType: 'jsonp',
            contentType: 'application/json',
            success: resolve,
        });

    }).then(parseMediawikiDashikiFormat);
}

class AnnotationApi {
    constructor () {}

    /**
     * Parameters
     *  graphModel: used for the metric config and data for processing and rendering
     *
     * Returns a {Promise} for {Array<Object>}
     *  Annotations relevant for a metric (considering any active breakdowns)
     *  The result array will have objects like this:
     *
     *  {
     *      label:          {String},
     *      title:          {String},
     *      date:           {Date},
     *      breakdown:      {String},
     *      splitValue:     {String},
     *  }
     */
    getAnnotations (graphModel) {
        if (graphModel.config.structure === 'top') return;
        return fetchAnnotations(config.annotationPath(graphModel.metricId))
            .then(annotations => processRawAnnotations(annotations, graphModel));
    }
}

export default AnnotationApi;
