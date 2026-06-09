import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Aparência'
      desc='Personalize a aparência do painel. Alternar automaticamente entre temas claro e escuro.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
