export default {

    sitematrix: {
        endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
    },

    aqs: {
        'pageviews-aggregate': {
            method: 'getAggregatedPageviews',
            endpoint: 'https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/{{project}}/{{access}}/{{agent}}/{{granularity}}/{{start}}/{{end}}'
        },

        'unique-devices': {
            method: 'getUniqueDevices'
        }
    }
}
