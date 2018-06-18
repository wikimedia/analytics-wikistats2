/**
* Title is inferred from state using sitematrix for friendly
* printing.
* See Dashboard.vue for usage example
**/
import config from './../config';
import { mapState, mapGetters } from 'vuex';
import sitematrix from '../apis/sitematrix';

export default {

    data() {
        return {
            title: null
        };
    },

    mounted() {
        this.updateTitle(this.project, this.metric);
    },
    /**
    * This creates properties to watch with less boiler plate that using $store.state
    **/
    computed: Object.assign(mapState([
                    'metric',
                    'project'])),

    methods: {
        updateTitle(project, metric) {

            sitematrix.getWikiOrGroupFromHostname(project).then(wikiInfo => {

                let title =  " Wikimedia Statistics ";

                if (wikiInfo.name) {

                    title = title + " - " + wikiInfo.name;
                } else if (wikiInfo.language.localName) {
                    title = title + " - " + wikiInfo.language.localName +" "+ wikiInfo.projectFamily.localName;
                }

                if (this.metric){
                    title = title + ' - ' + config.metrics[this.metric].fullName;
                }

                this.title = title;
            });
        }

    },

    watch: {
        project(){
            this.updateTitle(this.project, this.metric);
        },

        metric() {
            this.updateTitle(this.project, this.metric);
        },

        title(){
            // do not love global access here but title markup is "outside" vue
           document.title =  this.title;
        }
    }

};


