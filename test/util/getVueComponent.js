import VueI18n from 'vue-i18n';
import store from 'Src/store';
import messages from 'Src/i18n/en.json';
import { createLocalVue} from '@vue/test-utils';

const localVue = createLocalVue();

const getVueComponentInstance = (component, includes) => {
    localVue.use(VueI18n);
    const i18n = new VueI18n({
      locale: 'en',
      messages: {'en': messages}
    });
    const vm = new localVue(Object.assign(includes, {
        store,
        i18n
    }));
    return vm;
}

export default getVueComponentInstance;