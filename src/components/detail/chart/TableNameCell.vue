<template>
    <td>
        <a v-if="link" target="_blank" :href="link">
            {{elementName}}
        </a>
        <span v-else>
            {{elementName}}
        </span>
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
                    "//" + this.project + "/wiki/" + name
            };
            const transformation =
                LINK_TRANSFORMATIONS[this.nameKey] ||
                LINK_TRANSFORMATIONS.default;
            return transformation(name);
        },
        transformName(name) {
            const NAME_TRANSFORMATIONS = {
                user_text: username => username || "Anonymous user",
                country: isocode => (isoLookup[isocode] && isoLookup[isocode].en) || isocode,
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
                if (this.family || this.map || this.elementRawName === null) return;
                return this.transformLink(this.elementName);
            },
            elementName() {
                let name = this.transformName(this.elementRawName);
                const spacedName = name.replace(/_/g, " ");
                return spacedName;
            },
            elementRawName() {
                return this.value[this.nameKey];
            },
            map() {
                return this.nameKey === "country";
            },
            family () {
                return utils.isProjectFamily(this.project);
            }
        }
    )
};
</script>
<style type='text/css'>
td a {
    color: #000;
}
td a:hover {
    color: #6289d8;
}
</style>
