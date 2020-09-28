<template>
    <div class="filtersplit modal">
        <div class="header">
            <h3>Filter/split</h3>
            <i class="close icon" @click="disableModal"/>
        </div>
        <div class="container">
            <filter-split/>
        </div>
    </div>
</template>
<script type="text/javascript">
    import FilterSplit from './FilterSplit';
    export default {
        name: 'filter-split-modal',
        components: {FilterSplit},
        methods: {
            disableModal () {
                this.$store.commit('detail/dimensionsModalEnabled', false);
            }
        },
        mounted () {
            $(document).on('touchstart', (event) => {
                if(!this.$el.contains(event.target)) {
                    this.$store.commit('detail/dimensionsModalEnabled', false);
                }
                event.stopPropagation();
            });
        },
        destroyed () {
            $(document).off('touchstart');
        }
    }
</script>
<style>
.filtersplit.modal {
    position: fixed;
    z-index: 10;
    max-height: 50vh;
    min-height: 207px;
    width: 90%;
    bottom: -10px;
    left: 5vw;
    margin-right: auto;
    margin-left: auto;
    background: white;
    border-radius: 3px;
    -webkit-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
    -moz-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
}
.filtersplit.modal .container {
    padding: 20px;
    padding-top: 0;
    max-height: 45vh;
    overflow-y: scroll;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
}

.filtersplit.modal .header {
    position: relative;
    padding-top: 15px;
    padding-left: 20px;
    padding-right: 20px;
    top: 0;
    height: 7.5vh;
    background-color: white;
}

.filtersplit.modal .header h3 {
    display: inline-block;
}

.filtersplit.modal .header > i {
    float: right;
}

.filtersplit.modal .container::-webkit-scrollbar {
    display: none;
}
</style>
