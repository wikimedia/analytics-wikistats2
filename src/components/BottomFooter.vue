<template>
<section class="page-footer">
    <div class="img-container">
        <img class="wikimedia-logo" src="//upload.wikimedia.org/wikipedia/commons/f/f3/Wikimedia-logo-V.svg"
        alt="wikimedia-logo">
    </div>
    <div class="list-container list-documentation">
        <h5 class="list-heading">{{$t('footer-documentation')}}</h5>
        <ul class="list-content">
            <li><a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics/Wikistats2.0">{{$t('footer-about_wikistats')}}</a></li>
            <li><a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics/Systems/Wikistats_2#Technology">{{$t('footer-technology')}}</a></li>
            <li><a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics#Datasets">{{$t('footer-data_it_uses')}}</a></li>
            <li><a target="_blank" href="//foundation.wikimedia.org/wiki/Non-wiki_privacy_policy">{{$t('footer-privacy_policy')}}</a></li>
            <li><a style="color: #ffd;" target="_blank" href="//stats.wikimedia.org/index-v1.html">{{$t('general-original_wikistats')}}</a></li>
        </ul>
    </div>
    <div class="list-container list-contributing">
        <h5 class="list-heading">{{$t('footer-contributing')}}</h5>
        <ul class="list-content">
            <li><a target="_blank" href="https://github.com/wikimedia/analytics-wikistats2/search?o=desc&q=release&s=committer-date&type=Commits">Wikistats {{version}}</a></li>
            <li><a target="_blank" href="//wikitech.wikimedia.org/wiki/Analytics/Systems/Wikistats_2#Contributing_and_Deployment">{{$t('footer-contributing_guide')}}</a></li>
            <li><a target="_blank" href="//translatewiki.net/wiki/Translating:Wikistats_2.0">{{$t('footer-translate')}}</a></li>
            <li><a target="_blank" href="//phabricator.wikimedia.org/maniphest/task/edit/form/43/?projectPHIDs=Analytics-Wikistats,Analytics">{{$t('footer-report_a_bug')}}</a></li>
            <li><a target="_blank" href="//phabricator.wikimedia.org/maniphest/task/edit/form/102/?projectPHIDs=Analytics-Wikistats,Analytics">{{$t('footer-new_feature')}}</a></li>
        </ul>
    </div>
    <div class="list-container list-community">
        <h5 class="list-heading">{{$t('footer-community')}}</h5>
        <ul class="list-content">
            <li><a target="_blank" href="//phabricator.wikimedia.org/tag/analytics-wikistats/">Phabricator</a></li>
            <li><a target="_blank" href="//github.com/wikimedia/analytics-wikistats2">GitHub</a></li>
            <li><a target="_blank" href="//web.libera.chat/?channels=#wikimedia-analytics">IRC</a></li>
        </ul>
    </div>
    <div class="bottom-footer-container">
        <div class="credit">
            <i18n path="footer-design_credit">
                <template #aislinn >
                    <a target="_blank" href="https://aislinngrigas.com/"><span class="base-footer">Aislinn Grigas</span></a>
                </template>
            </i18n>
        </div>
        <div class="copyright">
            <i18n path="footer-copyright">
                <template #license>
                    <a target="_blank" href="//creativecommons.org/publicdomain/zero/1.0/"><span class="base-footer">{{$t('footer-license')}}</span></a>.
                </template>
            </i18n>
        </div>
    </div>
</section>
</template>

<script>

export default {
  name: 'bottom-footer',
  data () {
    return {
        version: 'v' + VERSION
    }
  }

};
</script>

<style scoped>

a, a:visited {
    color: #e6e6e7;
    font-weight: 300;
}

a:hover {
    color: #ffffff;
}

.page-footer {
    display: grid;
    grid-gap: 20px;
    grid-template-areas:
      'img-container list-documentation list-contributing list-community'
      'bottom-footer-container bottom-footer-container bottom-footer-container bottom-footer-container';
    color: #ffffff;
    font-weight: 300;
    font-family: sans-serif;
    line-height: 1.5;
    margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: -1rem;
}

.img-container {
    grid-area: img-container;
    padding: 1rem 5rem;
    margin-right: 100px;
}

.list-documentation {
    grid-area: list-documentation;
    padding: 1rem;
}

.list-contributing {
    grid-area: list-contributing;
    padding: 1rem;
}

.list-community {
    grid-area: list-community;
    padding: 1rem;
}

.bottom-footer-container {
    grid-area: bottom-footer-container;
    display: flex;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.6);
    padding: 1rem 2rem;
}

.wikimedia-logo{
    width: 100px;
    height: 100px;
}

.list-container {
    padding-bottom: 0;
}

.list-heading {
    font-weight: 400;
    font-size: 1.3rem;
}

.list-content {
    list-style: none;
    padding: 0;
    line-height: 1.7;
}

.copyright {
    margin-left: 200px;
}

@media(max-width: 767px) {
    .page-footer {
        grid-template-areas:
          'img-container img-container img-container'
          'list-documentation list-contributing list-community'
          'bottom-footer-container bottom-footer-container bottom-footer-container';
    }

    .list-container {
      margin: auto;
    }

    .img-container {
        display: block;
        margin: auto;
    }
}

@media(max-width: 500px) {
    .page-footer {
        grid-template-areas:
          'img-container img-container'
          'list-documentation list-contributing'
          'list-community list-community'
          'bottom-footer-container bottom-footer-container';
    }

    .list-documentation {
        display: block;
        margin: auto;
    }

    .list-contributing {
        display: block;
        margin: auto;
    }

    .list-community  {
        display: block;
        margin: auto;
    }

    .bottom-footer-container {
        display: flex;
        flex-direction: column;
        margin: auto;
        text-align: center;
        justify-content: center;
    }

    .copyright {
        margin: auto;
    }
}

</style>
