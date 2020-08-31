import React, { useState, useEffect, useRef } from "react";

import VideoAudio from './VideoAudio';

const Participant = ({ 
      participant,
      handleVillagerVoteButton,
      handleSeerCheckButton,
      handleMedicSaveButton,
      handleWerewolfVoteButton,
      night,
      checkWerewolf,
      checkSeer,
      checkMedic,
      localRole,
      werewolfChoice,
      didSeerHit,
      gameStarted
   }) => {

  let i
  let shouldWePlay = true
    console.log("what is checkWW", checkWerewolf)
    console.log("what is checkSeer", checkSeer)
    console.log("what is checkMedic", checkMedic)
    console.log("what is localRole", localRole)
  

  // return (
  //   <div className="participant">
  //     <h3>{participant.identity}</h3>
  //     <video ref={videoRef} autoPlay={true} />
  //     <audio ref={audioRef} autoPlay={true} muted={true} />
  //   </div>
  // );
  if(!participant) return
  //console.log.log("what is participant11111111", participant)
  if(!night){
    //console.log.log("DURING THE DAY NO OTHER CHECKS")
     i = (
    <div>
    <h3>DURING THE DAY NO OTHER CHECKS , role= {localRole}</h3>
    <h2>{werewolfChoice} was killed during the night </h2>
    <div className='participant'>
    <h3>{participant.identity}</h3>
   
    <button onClick={() => handleVillagerVoteButton(participant.identity)}>Kill</button>
  </div>

  </div>
  
   )
      

  }
  else if(!night && localRole === 'seer'){
    //console.log.log("DURING THE DAY AND WE ARE THE SEER")
      i = (
      <div>
      <h3>DURING THE DAY AND WE ARE THE SEER</h3>
      <h2>{werewolfChoice} was killed during the night , role= {localRole}</h2>
      <h2>{didSeerHit} is a werewolf</h2>
      <div className='participant'>
      <h3>{participant.identity}</h3>
    
      <button onClick={() => handleVillagerVoteButton(participant.identity)}>Kill</button>
    </div>

    </div>

    )
     
      
  
  }
  else if(night && !checkWerewolf && localRole === 'werewolf'){
    //console.log.log("DURING THE NIGHT AND WEREWOLVES AREN'T DONE CHECKING AND WE ARE A WEREWOLF")
    shouldWePlay= true
    i =  (
      <div className='participant'>
        <h3>DURING THE NIGHT AND WEREWOLVES AREN'T DONE CHECKING AND WE ARE A WEREWOLF , role= {localRole}</h3>
        <h3>{participant.identity}</h3>
   
        <button onClick={() => handleWerewolfVoteButton(participant.identity)}>Kill</button>
      </div>
    );
  }
  else if(night && checkWerewolf && !checkSeer && localRole === 'seer'){
    //console.log.log("DURIONG THE NIGHT AND WEREWOLVES ARE DONE, SEER IS NOT DONE, AND WE ARE THE SEER")
    shouldWePlay= true
    i =  (
      <div className='participant'>
        <h3>DURIONG THE NIGHT AND WEREWOLVES ARE DONE, SEER IS NOT DONE, AND WE ARE THE SEER , role= {localRole}</h3>
        <h3>{participant.identity}</h3>
       
        <button onClick={(e) => handleSeerCheckButton(participant.identity)}>Check Role</button>
      </div>
    );
  }
  else if(night && checkWerewolf && checkSeer && !checkMedic && localRole === 'medic'){
    //console.log.log("DURING THE NIGHT AND WEREWOLVES ARE DONE AND SEE IS DONE AND MEDIC IS NOT DONE AND WE ARE THE MEDIC")
    shouldWePlay = true
    i = (
      <div className='participant'>
        <h3>DURING THE NIGHT AND WEREWOLVES ARE DONE AND SEER IS DONE AND MEDIC IS NOT DONE AND WE ARE THE MEDIC , role= {localRole}</h3>
        <h3>{participant.identity}</h3>
        
        <button onClick={(e) => handleMedicSaveButton(participant.identity)}>Save Person</button>
      </div>
    );
  }
  else if(!gameStarted){
    console.log("SEER IS STILL NOT SEEING GAME STARTED")
    shouldWePlay = true
  i =  (
      <div className='participant'>
        <h3>GAME NOT STARTED, role= {localRole}</h3>
        <h3>{participant.identity}</h3>
        <h3>You are not allowed to see this person during the night</h3>
       
       
      </div>
    );

  }
  else {
    //console.log.log("DURING THE NIGHT BUT WE ARE A VANILLA VILLAGER")
   
    shouldWePlay = false
i = (
      <div className='participant'>
        <h3>222DURING THE NIGHT BUT WE ARE A VANILLA VILLAGER, OR DONE WITH OUR TASK, role= {localRole}</h3>
        <h3>{participant.identity}</h3>
        <h3>You are not allowed to see this person during the night</h3>
        
       
      </div>
    ) 
  }
  if(shouldWePlay){
    return (
      <div>
        {i}
        {/* <video ref={videoRef} autoPlay={shouldWePlay} muted={true} />
        <audio ref={audioRef} autoPlay={shouldWePlay} muted={true} /> */}
        <VideoAudio participant={participant} />
      </div>
    )
  }
  else {
    return (
      <div>
        {i}
        {/* <video ref={videoRef} autoPlay={shouldWePlay} muted={true} />
        <audio ref={audioRef} autoPlay={shouldWePlay} muted={true} /> */}
        <div>You are not allowed to see video at this time</div>
      </div>
    )
  }

  
};

export default Participant;
