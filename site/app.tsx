import { useState } from 'react'
import type { PersonalityId } from '../src/motion/profiles'
import { Cast } from './cast'
import { Guide, type GuideKind } from './guide'
import { Hero } from './hero'
import { Styles } from './styles'
import { MASCOT } from './mascots'

function App() {
  const [picked, setPicked] = useState<string>(MASCOT)
  const [personality, setPersonality] = useState<PersonalityId>('bouncy')
  const [guide, setGuide] = useState<GuideKind | null>(null)

  const pick = (character: string) => {
    if (character === 'bon-cheffy' && picked !== 'bon-cheffy') {
      setPersonality('bouncy')
    }
    setPicked(character)
  }

  const openUse = (character: string) => {
    pick(character)
    setGuide('use')
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[960px] px-6 pt-20 pb-28 sm:px-10 sm:pt-28">
        <Hero
          character={picked}
          personality={personality}
          onPersonality={setPersonality}
          onMakeYourOwn={() => setGuide('make')}
        />
        <Styles onUse={openUse} />
        <Cast
          picked={picked}
          personality={personality}
          onPick={pick}
          onUse={openUse}
          onMakeYourOwn={() => setGuide('make')}
        />
      </div>

      <Guide
        kind={guide}
        character={picked}
        personality={personality}
        onClose={() => setGuide(null)}
      />
    </>
  )
}

export default App
