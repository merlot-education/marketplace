import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class WordSelectionEasterEggService {
  protected environment = environment;
  private selectedWords: string[] = [];
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

  addSelectedWord(word: string) {
    // Add the selected word to the list
    this.selectedWords.push(word.trim().toLocaleLowerCase());
    // Keep only the last two selected words
    this.selectedWords = this.selectedWords.slice(-2);
    if (this.checkConditions()) {
      this.playSong();
    }
  }

  checkConditions(): boolean {
    if (this.selectedWords.length >= 1 && this.secretPhrases.includes(this.selectedWords.at(-1))) {
      return true;
    } else {
      return this.selectedWords.length === 2 && this.secretPhrases.includes(this.selectedWords.join(' '));
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
