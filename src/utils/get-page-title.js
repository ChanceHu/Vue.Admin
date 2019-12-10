import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Vue.Learn'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
