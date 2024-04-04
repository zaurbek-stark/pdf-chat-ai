'use client';

import Image from 'next/image';
import Wrapper from './components/Wrapper';

export default function Home() {
  return (
    <main className="App">
      <div className='container'>
        <div className='logoBox'>
          <Image src="/logo.png" alt="InterviewGPT logo" width="400" height="75" />
        </div>
        <Wrapper />
      </div>
    </main>
  )
}