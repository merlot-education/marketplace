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
                                     'MERLOT MPO'].map(s => s.toLowerCase());;

  addSelectedWord(word: string) {
      // Add the selected word to the list
      this.selectedWords.push(word.trim());
      // Keep only the last two selected words
      this.selectedWords = this.selectedWords.slice(-2);
  }

  checkConditions(): boolean {
    if (this.selectedWords.length === 2){
      // Return whether the stored selections match one of the secret phrases
        return this.secretPhrases.includes(this.selectedWords.join(' '));
    } else {
      return false;
    }
  }

  playSong() {
    //const audio = new Audio(this.environment.merlot_song_url);
    const audio = new Audio("../../../../../assets/audio/MERLOT-Bildung_neu_definiert.mp3");
    audio.addEventListener('error', () => {
      console.error('Error loading song.');
    });
    
    audio.addEventListener('canplaythrough', () => {
      // Only play the audio if it has loaded successfully
      audio.play();
    });
  }
}
