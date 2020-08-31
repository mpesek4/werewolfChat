import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import Participant from './Participant';
import {db} from './firebase'

 

const Room = ({ roomName, token, handleLogout }) => {
  
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);

  // potentially needed game logic state
  const [night, setNight] = useState(true);
  const [localRole, setLocalRole] = useState("");
  const [gameStarted,setGameStarted] = useState(false)
  const [checkWerewolf, setCheckWerewolf] = useState(false)
  const [checkSeer, setCheckSeer] = useState(false)
  const [checkMedic, setCheckMedic] = useState(false)
  const [werewolfChoice, setWerewolfChoice] = useState(false)
  const [didSeerHit, setDidSeerHit] = useState(false)

  //console.log("WHAT IS night", night)
  const testingReset = () => {
    const newGame = {
      Night: true,
      checkMajority: false,
      checkMedic: false,
      checkSeer: false,
      checkWerewolf: false,
      dead: [],
      gameStarted: false,
      majorityReached: false,
      medic: "",
      medicChoice: "",
      players: [],
      seer: "",
      seerChoice: "",
      villagers: [],
      votesVillagers: [],
      votesWerewolves: [],
      werewolves: [],
      werewolvesChoice: ""

    }
    db.collection('rooms').doc(roomName).update(newGame)
  }
  const handleStartGame = () => {
    setGameStarted(true)
    //console.log("starting game")
    db
      .collection('rooms')
      .doc(roomName)
      .update({gameStarted: true});
  }

  const handleNight = (someValue) => { 
    // some logic
    setNight(someValue)
  }
  const handleLocalRole = (someValue) => { 
    // some logic
    console.log("are we making it into handleLocalRole")
    setLocalRole(someValue)
  }
  const handleCheckMedic = (someValue) => { 
    // some logic
    setCheckMedic(someValue)
  }
  const handleGameStarted = (someValue) => { 
    // some logic
    setGameStarted(someValue)
  }
  const handleCheckWerewolf= (someValue) => { 
    // some logic
    setCheckWerewolf(someValue)
  }
  const handleCheckSeer = (someValue) => { 
    // some logic
    setCheckSeer(someValue)
  }
  const handleWerewolfChoice = (someValue) => { 
    // some logic
    setWerewolfChoice(someValue)
  }
 const handleDidSeerHit = (someValue) => { 
    // some logic
    setDidSeerHit(someValue)
  }  


  // GAME LOGIC FUNCTIONS

  function handleNightToDay(game, roomName, localUserId) {
    //console.log("handleNightToDay starting", game, roomName, localUserId)
    if (game.villagers.length === 0) {

      assignRolesAndStartGame(game, roomName, localUserId);
    }
    handleWerewolfVote(game,roomName); // checks if werewolves have agreed on a vote, and sets in our DB
    // this.handleSeer();
    // this.handleMedic();
    if (game.checkWerewolf && game.checkSeer && game.checkMedic) {
      if (game.werewolvesChoice === game.medicChoice) {
        game.werewolvesChoice = '';
        handleWerewolfChoice("")
      } else {
        game.villagers = game.villagers.filter((villager) => {
          return villager !== game.werewolvesChoice;
        });
        if (game.werewolvesChoice !== '') {
          game.dead.push(game.werewolvesChoice);
          game.players= game.players.filter(player => 
            player != game.werewolvesChoice
          )
        }
      }
    } //outer IF
    else {
      return;
    }
    game.Night = false;
    game.medicChoice = '';
    game.votesWerewolves = '';
    game.checkWerewolf = false;
    game.checkMedic = false;
    game.checkSeer = false;
    game.votesWerewolves = [];
    game.villagersChoice = '';
    //updating game state in DB
  
    db
      .collection('rooms')
      .doc(roomName)
      .update(game);
  
   
    handleNight(false)
  }
  
  /**
   * Handles the transition from day to night by filtering out the player killed, checking if they were a villager or werewolf, resetting all votes, and updating game status
   * @param {*} game - game object gotten from the snapshot of the 'rooms' document
   */
  
   function handleDayToNight(game,roomName) {
    handleMajority(game, roomName);
    if (game.majorityReached) {
      if (game.villagers.includes(game.villagersChoice)) {
        game.villagers = game.villagers.filter((villager) => {
          return villager !== game.villagersChoice;
        });
      } 
      else {
        game.werewolves = game.werewolves.filter((werewolf) => {
          return werewolf !== game.villagersChoice;
        });
      }
      if(!game.dead.includes(game.villagersChoice)){
        game.dead.push(game.villagersChoice);
      }
      
    } //outer IF
    else {
      return;
    }
    game.Night = true;
    // game.villagersChoice = ""
    game.wereWolvesChoice = '';
    game.majorityReached = false;
    game.votesVillagers = [];
    //updating game state in DB
  
    //console.log('DURING DAY, ABOUT TO GO TO NIGHT', game);
  
    db
      .collection('rooms')
      .doc(roomName)
      .update(game);
  
    handleNight(true)
  }
  
  /**
   * Checks for a majority vote on all players killing one person; once found, updates the villagers' choice which will be used to announce the player has been killed when day turns to night.
   * @param {*} game - game object gotten from the snapshot of the 'rooms' document once the game starts
   */
   async function handleMajority(game, roomName) {
    //end goal to update villageGers
  
    const totalPlayers = game.villagers.length + game.werewolves.length;
    let votingObject = {}; //key will be a user, value is how many votes for that user
    // let players = await db.collection('rooms').doc(this.state.gameId).data().players
  
    let players = await db
      .collection('rooms')
      .doc(roomName)
      .get();
    let votesVillagers = players.data().votesVillagers;
  
    for (let player of votesVillagers) {
      // need to add rooms and users tables to state
      if (Object.keys(votingObject).includes(player)) {
        votingObject[player] += 1;
      } else {
        votingObject[player] = 1;
      }
    }
    //console.log('in handle majority', votingObject);
  
    for (let player of Object.keys(votingObject)) {
      if (votingObject[player] > Math.floor(totalPlayers / 2)) {
        let newDead = players.data().dead
        newDead.push(player)
        db
          .collection('rooms')
          .doc(roomName)
          .update({ villagersChoice: player, majorityReached: true, dead: newDead });
      }
    }
  }
  
  /**
   * Handler function which updates a villager's vote based on the user they are choosing to kill
   * @param {*} userPeerId - the user's PeerJS ID (that is, the user a villager is trying to kill)
   */
   async function handleVillagerVoteButton(participantIdentity) {
    
  
    let votesVillagers = await db
      .collection('rooms')
      .doc(roomName)
      .get();
  
    votesVillagers = votesVillagers.data().votesVillagers;
    votesVillagers.push(participantIdentity);
  
    await db
      .collection('rooms')
      .doc(roomName)
      .update({ votesVillagers: votesVillagers });
  }
  
   async function handleWerewolfVoteButton(participantIdentity) {
    
  
    let votesWerewolves = await db
      .collection('rooms')
      .doc(roomName)
      .get();

    console.log("Are we getting the correct", participantIdentity)
  
    votesWerewolves = votesWerewolves.data().votesWerewolves;
    votesWerewolves.push(participantIdentity);
  
    await db
      .collection('rooms')
      .doc(roomName)
      .update({ votesWerewolves: votesWerewolves});
  }
  
   async function handleSeerCheckButton(participantIdentity) {
    const roomObj = await db
      .collection('rooms')
      .doc(roomName)
      .get();
  
    let werewolves = roomObj.data().werewolves
  
    
    if (werewolves.includes(participantIdentity)){
        handleDidSeerHit(participantIdentity)
    }
    handleCheckSeer(true)
  
    await db
        .collection('rooms')
        .doc(roomName)
        .update({ checkSeer: true, seerChoice: participantIdentity});
  }
   async function handleMedicSaveButton(participantIdentity) {
    handleCheckMedic(true)
  
    await db
      .collection('rooms')
      .doc(roomName)
      .update({ checkMedic: true, medicChoice: participantIdentity });
  }
  
  /**
   * Checks for a majority vote on werewolves killing one person; once found, updates the werewolves' choice which will be used to announce the player has been killed when night turns to day.
   * @param {*} game - game object gotten from the snapshot of the 'rooms' document
   */
   async function handleWerewolfVote(roomObj, roomName) {
    // const roomObj = await db
    //   .collection('room')
    //   .doc(roomName)
    //   .get();
  
    // let players = roomObj.data().players;
    // ^^^ do we need this code above with 'players' ?
  
    const totalPlayers = roomObj.werewolves.length;
  
    let votesWerewolves = await db
      .collection('rooms')
      .doc(roomName)
      .get();
    votesWerewolves = votesWerewolves.data().votesWerewolves;
  
    //console.log('what are my villagers', votesWerewolves);
  
    let votingObject = {};
  
    for (let player of votesWerewolves) {
      // need to add rooms and users tables to state
      if (Object.keys(votingObject).includes(player)) {
        votingObject[player] += 1;
      } else {
        votingObject[player] = 1;
      }
    }
    //console.log('voting object is', votingObject);
    for (let player of Object.keys(votingObject)) {
      if (votingObject[player] > Math.floor(totalPlayers / 2)) {
        // db.collection('rooms').doc(this.state.gameId).villagersChoice.update(player) // find real way to do this
        db
          .collection('rooms')
          .doc(roomName)
          .update({ werewolvesChoice: player, checkWerewolf: true });
      // also have to update local state
      
    
      handleCheckWerewolf(true)
      handleWerewolfChoice(player)
      }
    }
  }
  
  /**
   * Checks if the seer voted, and (if so) subsequently updates the 'checkSeer' boolean in the 'rooms' database
   */
   async function handleSeer(roomName) {
    const player = await db
      .collection('rooms')
      .doc(roomName)
      .get();
  
    const seerChoice = player.data().seerChoice;
  
    if (seerChoice === '') return;
    else {
      //console.log('setting checkSeer to true');
      db
        .collection('rooms')
        .doc(roomName)
        .update({ checkSeer: true });
      // also have to update local state
      handleCheckSeer(true)
    }
  }
  
  /**
   * Checks if the medic voted, and (if so) subsequently updates the 'checkMedic' boolean in the 'rooms' database
   */
   async function handleMedic(roomName) {
    const player = await db
      .collection('rooms')
      .doc(roomName)
      .get();
  
    const medicChoice = player.data().medicChoice;
  
    if (medicChoice === '') return;
    else {
      //console.log('setting checkMedic to true');
      db
        .collection('rooms')
        .doc(roomName)
        .update({ checkMedic: true });
  
      // also have to update local state
      
      await handleCheckMedic(true)
    }
  }
  
  /**
   * Randomly assigns roles to users, updates the roles in firestore, and subsequently updates the 'gameStarted' boolean in the 'rooms' database
   * @param {*} game - game object gotten from the snapshot of the 'rooms' database once the game starts
   */
   async function assignRolesAndStartGame(game, roomName, localUserId) {
    console.log('In assignRolesAndStartGame', game, roomName,localUserId);
    let gameState = await db
      .collection('rooms')
      .doc(roomName)
      .get();
  
    console.log("what is gameState in assignRoles",gameState)
    
    let players = gameState.data().players
  
    //randomize later
    //console.log('what is users in assign roles', users);
  
    let werewolves = [];
    let villagers = [];
  
    //shuffle users array
    // for (let i = users.length - 1; i > 0; i--) {
    //   let j = Math.floor(Math.random() * (i + 1));
    //   [users[i], users[j]] = [users[j], users[i]];
    // }
  
    players.forEach((playerName, i) => {
      //console.log('what does my user look like', doc.id);
      
  
      if (i < 2) {
        //console.log('werewolves are ', werewolves);
        werewolves.push(playerName);
      } else if (i === 2) {
        db
          .collection('rooms')
          .doc(roomName)
          .update({ seer: playerName });
        villagers.push(playerName);
      } else if (i === 3) {
        db
          .collection('rooms')
          .doc(roomName)
          .update({ medic: playerName });
        villagers.push(playerName);
      } else {
        villagers.push(playerName);
      }
    });
  
    await db
      .collection('rooms')
      .doc(roomName)
      .update({ werewolves: werewolves });
    await db
      .collection('rooms')
      .doc(roomName)
      .update({ villagers: villagers });
  
    db
      .collection('rooms')
      .doc(roomName)
      .update({ gameStarted: true });
  
    


  
  //search for localUsersRole
  villagers = gameState.data().villagers
  werewolves = gameState.data().werewolves
  let seer = gameState.data().seer
  let medic = gameState.data().medic
  
  if(villagers.includes(localUserId)){
    console.log("setting role as villager")
    handleLocalRole("villager")
  }
  if(werewolves.includes(localUserId)){
    console.log("setting role as werewolf")
    handleLocalRole("werewolf")
  }
  if(seer === localUserId){
    console.log("setting role as seer")
    handleLocalRole("seer")
  }
  if(medic === localUserId){
    console.log("setting role as medic")
    handleLocalRole("medic")
  }
  }

  //end of GAME LOGIC functions


 
  // useEffect(() => {
  //   //console.log("GAME STARTED USE EFFECT")
  //   db
  //   .collection('rooms')
  //   .doc(roomName)
  //   .onSnapshot(async (snapshot) => {
  //     //console.log("made it into onSnapshot")
  //     let gameState = snapshot.data();

  //     //console.log("gameState is", gameState)

  //     if (!gameState.gameStarted) return;

  //     if (gameState.Night) {
  //       //console.log("pre initial handleNightDay")
  //       console.log("what is our local identity", participants[0])
        
  //       handleNightToDay(gameState, roomName, participants[0].identity);
  //     } else {
  //       //console.log("are we making it into here")
  //       handleDayToNight(gameState,roomName);
  //     }
  //   });
    
  // }, [gameStarted]);

   useEffect(() => {
    const participantConnected = async participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
     
    };

    const participantDisconnected = participant => {


      console.log("player identity BEFOR ", participants)
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
      let playerIdentitys = participants.map(participant => participant.identity)
      setTimeout(function(){ alert("Hello"); }, 3000);

      console.log("player identity AFTER ", playerIdentitys)

      db.collection("rooms").doc(roomName).update({players: playerIdentitys})

    };

    Video.connect(token, {
      name: roomName
    }).then( async room => {
     
      setRoom(room);
      setParticipants(prevParticipants => [...prevParticipants, room.localParticipant]);

      const gameState = await db
        .collection('rooms')
        .doc(roomName).get()

      let prevPlayers = gameState.data().players
      prevPlayers.push(room.localParticipant.identity)
      db.collection("rooms").doc(roomName).update({players: prevPlayers})


      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.participants.forEach(participantConnected);

      db
      .collection('rooms')
      .doc(roomName)
      .onSnapshot(async (snapshot) => {
        //console.log("made it into onSnapshot")
        let gameState = snapshot.data();

        console.log("what is our gameStarted111", gameState)

        setGameStarted(gameState.gameStarted)

        setCheckSeer(gameState.checkSeer)
        setCheckMedic(gameState.checkMedic)
        setCheckWerewolf(gameState.checkWerewolf)
        
        let newParticipants = gameState.players.filter(player => 
          !gameState.dead.includes(player)    
        )
        console.log("FILTERED FOR DEAD PPL", newParticipants)

        setParticipants(prevParticipants =>
          prevParticipants.filter(p => newParticipants.includes(p.identity))
        );
        
        

        
        
      

        //console.log("gameState is", gameState)

        if (!gameState.gameStarted) return;

        if (gameState.Night) {
          //console.log("pre initial handleNightDay")
          
          
          handleNightToDay(gameState, roomName,room.localParticipant.identity);
        } else {
          //console.log("are we making it into here")
          handleDayToNight(gameState,roomName);
        }
      });
    });

    return () => {
      setRoom(async currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          currentRoom.disconnect();
          

          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [roomName, token]);

  const remoteParticipants = participants.map((participant,idx) => {
    if(idx ===0) return
     return (
      <Participant key={participant.sid} 
      participant={participant}

      handleVillagerVoteButton={handleVillagerVoteButton}
      handleSeerCheckButton={handleSeerCheckButton}
      handleMedicSaveButton={handleMedicSaveButton}
      handleWerewolfVoteButton={handleWerewolfVoteButton}

      night={night}
      localRole={localRole}
      checkWerewolf={checkWerewolf}
      checkSeer={checkSeer}
      checkMedic={checkMedic}
      werewolfChoice={werewolfChoice}
      didSeerHit={didSeerHit}
      gameStarted={gameStarted}

      
      /> 
     )
             
     });

  return (
    <div className="room">
      <h2>Room: {roomName}</h2>
      <button onClick={handleLogout}>Log out</button>
      <div className="local-participant">
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
            handleVillagerVoteButton={handleVillagerVoteButton}
            handleSeerCheckButton={handleSeerCheckButton}
            handleMedicSaveButton={handleMedicSaveButton}
            handleWerewolfVoteButton={handleWerewolfVoteButton}

            night={night}
            localRole={localRole}
            checkWerewolf={checkWerewolf}
            checkSeer={checkSeer}
            checkMedic={checkMedic}
            werewolfChoice={werewolfChoice}
            didSeerHit={didSeerHit}
            gameStarted={gameStarted}
          />
        ) : (
          ''
        )}
      </div>
      <button onClick={()=>{handleStartGame()}}>Start Game</button>
      <button onClick={() => {testingReset()}}> Reset game</button>
      <h3>Remote Participants</h3>
      <div className="remote-participants">{remoteParticipants}</div>
    </div>
  );
};

export default Room;
