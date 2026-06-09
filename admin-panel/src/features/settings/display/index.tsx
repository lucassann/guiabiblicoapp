import { ContentSection } from '../components/content-section'
import { DisplayForm } from './display-form'

export function SettingsDisplay() {
  return (
    <ContentSection
      title='Visualização'
      desc='Ligue ou desligue os itens que você quer visualizar no painel.'
    >
      <DisplayForm />
    </ContentSection>
  )
}
