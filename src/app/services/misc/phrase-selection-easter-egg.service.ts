/*
 *  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PhraseSelectionEasterEggService {
  protected environment = environment;
  private selectedPhrases: string[] = [];
  private secretPhrases: string[] = ['MERLOT marketplace',
                                     'MERLOT Marktplatz', 
                                     'MERLOT project',
                                     'Projekt MERLOT', 
                                     'Förderprojekt MERLOT', 
                                     'MERLOT MPO'].map(s => s.toLowerCase());
  private easterEggTriggered: boolean = false;

  isEasterEggTriggered(): boolean {
    return this.easterEggTriggered;
  }

  addSelectedPhrase(phrase: string) {
    // Add the selected phrase to the list
    this.selectedPhrases.push(phrase.trim().toLocaleLowerCase());
    // Keep only the last two selected phrases
    this.selectedPhrases = this.selectedPhrases.slice(-2);
    if (this.checkConditions()) {
      this.playSong();
    }
  }

  checkConditions(): boolean {
    if (this.selectedPhrases.length >= 1 && this.secretPhrases.includes(this.selectedPhrases.at(-1))) {
      return true;
    } else {
      return this.selectedPhrases.length === 2 && this.secretPhrases.includes(this.selectedPhrases.join(' '));
    }
  }

  playSong() {
    const audio = new Audio(this.environment.merlot_song_url);
    audio.addEventListener('error', () => {
      console.error('Error loading easter egg.');
    });
    
    audio.addEventListener('canplaythrough', () => {
      // Only play the audio if it has loaded successfully
      this.easterEggTriggered = true; // Disable easter egg
      audio.play();
    });
  }
}
