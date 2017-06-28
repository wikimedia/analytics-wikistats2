export default {

    sitematrix: {
        endpoint: 'https://meta.wikimedia.org/w/api.php?action=sitematrix&formatversion=2&format=json&maxage=3600&smaxage=3600'
    },

    aqs: {
        'pageviews-aggregate': {
            method: 'getAggregatedPageviews'
        },

        'unique-devices': {
            method: 'getUniqueDevices'
        }
    }
}
