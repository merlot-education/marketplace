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

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './merlot.component.html',
  styleUrls: ['./merlot.component.scss']
})
export class MerlotComponent implements OnInit {
  @ViewChild('merlotLogo') imageRef!: ElementRef;
  protected environment = environment;
  clickCounter = 0;
  maxClicks = 3; 

  constructor() {
  }

  ngOnInit(): void {
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

  handleImageClick(event: MouseEvent) {
    
    const image = this.imageRef.nativeElement;
    const imageWidth = image.width;
    const imageHeight = image.height;

    // Calculate relative click position
    const rect = image.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if the click is in the right upper quarter of the image
    if (mouseX >= image.width / 2 && mouseY <= imageHeight / 2) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match image size
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image onto the canvas
      context.drawImage(image, 0, 0, image.width, image.height);

      // Get pixel color at the clicked position
      const pixelData = context.getImageData(mouseX, mouseY, 1, 1).data;
      const [r, g, b] = pixelData; // RGB values
      console.log(`Clicked pixel color: RGB(${r}, ${g}, ${b})`);

      // Check if clicked pixel was in the purple triangle
      if (r == 114 && g == 78 && b == 145) {
        this.clickCounter++;
        console.log(`Secret area clicked! Count: ${this.clickCounter}`);

        if (this.clickCounter == this.maxClicks) {
          this.playSong();
        }
      }
    }
  }
}
