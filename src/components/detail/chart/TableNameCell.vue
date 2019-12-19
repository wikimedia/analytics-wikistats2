<template>
    <td>
        <div class="nameCell" v-if="link">
            <a target="_blank" :href="link">
                {{elementName}}
            </a>
        </div>
        <div class="nameCell" v-else>
            <span>
                {{elementName}}
            </span>
        </div>
    </td>
</template>
<script type="text/javascript">
import isoLookup from "./MapChart/isoLookup";
import { mapState } from 'vuex';
import utils from "../../../utils"

export default {
    name: "table-name-cell",
    props: ["index", "value", "nameKey"],
    methods: {
        transformLink(name) {
            const LINK_TRANSFORMATIONS = {
                user_text: username =>
                    "//" + this.project + "/wiki/Special:Contributions/" + username,
                default: name =>
                    "//" + this.project + "/wiki/" + name,
                file_path: file =>
                    '//upload.wikimedia.org' + file
            };
            const transformation =
                LINK_TRANSFORMATIONS[this.nameKey] ||
                LINK_TRANSFORMATIONS.default;
            return transformation(name);
        },
        transformName(name) {
            const NAME_TRANSFORMATIONS = {
                user_text: username => (username || "Anonymous user"),
                country: isocode => (isoLookup[isocode] && isoLookup[isocode].en) || isocode,
                file_path: name => name,
                page_title: title => title.replace(/_/g, " ")
            };
            const transformation = NAME_TRANSFORMATIONS[this.nameKey];
            if (!transformation) return name;
            return transformation(name);
        }
    },
    computed: Object.assign(
        mapState([
            'project',
        ]), {
            link() {
                if (this.noLink) return;
                return this.transformLink(this.elementName);
            },
            noLink() {
                const casesWithNoLink = [
                    this.allWikis && !(this.nameKey === "file_path"),
                    this.family,
                    this.map,
                    this.elementRawName === null
                ];
                return casesWithNoLink.some(c => c)
            },
            elementName() {
                return this.transformName(this.elementRawName);
            },
            elementRawName() {
                return this.value[this.nameKey];
            },
            map() {
                return this.nameKey === "country";
            },
            family () {
                return utils.isProjectFamily(this.project);
            },
            allWikis () {
                return this.project === 'all-projects'
            }
        }
    )
};

</script>
<style type='text/css'>
div.nameCell {
    max-width: 552px;
    overflow: hidden;
    text-overflow: ellipsis;
}
td a {
    color: #000;
    text-decoration: underline;
    text-decoration-style: dotted;
}
td a:visited {
    color: #000;
}
td a:hover {
    color: #6289d8;
}
</style>
