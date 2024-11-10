import request from "supertest";
import app from "../../server";
import { connectDB, disconnectDB } from "../../config/db";
import Player from "../../models/Player";
import Team from "../../models/Team";
import Tournament from "../../models/Tournament";
import { Types } from "mongoose";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjdjYzNiZDIxYjVjNmQxNDE2ZWMzNSIsImlhdCI6MTczMDY2MTQ2MiwiZXhwIjoxNzQ2MjEzNDYyfQ.eIIEyryXkKXJXMMjvr3kfVcELkkC0wu9xHSO4eu-rEw";
const tokenNoValido = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjdmYjkwMTA5OTU0N2ZkNWJhZDE2ZCIsImlhdCI6MTczMDY4Nzg1NSwiZXhwIjoxNzQ2MjM5ODU1fQ.fqgqp3w3jCZZjv6WaDGkD5nbWhlfRU3viTmvQ9ABIgA"

beforeAll(async () => {
  await connectDB();
  await Player.deleteMany({});
  await Team.deleteMany({});
  await Tournament.deleteMany({});
});

beforeEach(async () => {
  await Player.deleteMany({});
  await Team.deleteMany({});
  await Tournament.deleteMany({});
});

afterAll(async () => {
  await Player.deleteMany({});
  await Team.deleteMany({});
  await Tournament.deleteMany({});
  await disconnectDB();
});

describe('POST /api/players/:teamId/players', () => {
  it('Should create a new player', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Crear un equipo de prueba
    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    const response = await request(app)
      .post(`/api/players/${team._id}/players`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: 'Jugador de prueba',
        lastName: 'Apellido de prueba',
        number: 10,
        curp: 'GORA021008HDFNMNA1',
        position: 'Base',
        team: team._id
      });

    expect(response.status).toBe(201);
    expect(response.text).toBe('Jugador creado');

    const createdPlayer = await Player.findOne({ curp: 'GORA021008HDFNMNA1' });
    expect(createdPlayer).not.toBeNull();
    expect(createdPlayer).toHaveProperty('name', 'Jugador de prueba');
    expect(createdPlayer).toHaveProperty('lastName', 'Apellido de prueba');
    expect(createdPlayer).toHaveProperty('number', 10);
    expect(createdPlayer).toHaveProperty('curp', 'GORA021008HDFNMNA1');
    expect(createdPlayer).toHaveProperty('position', 'Base');
    expect(createdPlayer).toHaveProperty('team', team._id);
  });

  it('Should return an error if the CURP is already in use', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Crear un equipo de prueba
    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    // Crear un jugador de prueba
    await Player.create({
      name: 'Jugador de prueba',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id
    });

    const response = await request(app)
    .post(`/api/players/${team._id}/players`)
    .set("Authorization", `Bearer ${token}`)
      .send({
        name: 'Jugador de prueba',
        lastName: 'Apellido de prueba',
        number: 10,
        curp: 'GORA021008HDFNMNA1',
        position: 'Base',
        team: team._id
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'El CURP ya está en uso por otro jugador');
  });

  it('Should return an error if there is a problem creating the player', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Crear un equipo de prueba
    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    // Simular un error en la base de datos
    jest.spyOn(Player.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post(`/api/players/${team._id}/players`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: 'Jugador de prueba',
        lastName: 'Apellido de prueba',
        number: 10,
        curp: 'GORA021008HDFNMNA1',
        position: 'Base',
        team: team._id
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al crear el jugador');
  });

  it('Should return an error if the user is not authorized', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Crear un equipo de prueba
    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    const response = await request(app)
      .post(`/api/players/${team._id}/players`)
      .set("Authorization", `Bearer ${tokenNoValido}`)
      .send({
        name: 'Jugador de prueba',
        lastName: 'Apellido de prueba',
        number: 10,
        curp: 'GORA021008HDFNMNA1',
        position: 'Base',
        team: team._id
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'No tienes permisos para realizar esta acción');
  });
});

describe('GET /api/players/:teamId/players', () => {
  it('Should get all players in a team', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Crear un equipo de prueba
    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    // Crear jugadores de prueba
    await Player.create([
      { name: 'Jugador 1',lastName: 'Apellido de prueba',number: 10, curp: 'GORA021008HDFNMNA1', position: 'Base', team: team._id },
      { name: 'Jugador 2',lastName: 'Apellido de prueba2',number: 10, curp: 'GORA021008HDFNMNA2', position: 'Pivot', team: team._id },
    ]);

    const response = await request(app)
      .get(`/api/players/${team._id}/players`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    // Ordenar los jugadores por nombre antes de verificar
    const sortedPlayers = response.body.sort((a: any, b: any) => a.name.localeCompare(b.name));

    expect(sortedPlayers[0]).toHaveProperty('name', 'Jugador 1');
    expect(sortedPlayers[1]).toHaveProperty('name', 'Jugador 2');
  });

  it('Should return an error if there is a problem retrieving players', async () => {
    // Simular un error en la base de datos
    jest.spyOn(Player, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    const response = await request(app)
      .get(`/api/players/${team._id}/players`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obterner los equipos');
  });

  it('Should return an empty array if no players exist for the team', async () => {
    // Crear un torneo y equipo sin jugadores
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo vacío',
      role: '6727cc3bd21b5c6d1416ec35'
    });

    const team = await Team.create({
      nameTeam: 'Equipo vacío',
      nameCoach: 'Coach vacío',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    const response = await request(app)
      .get(`/api/players/${team._id}/players`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
    expect(response.body).toEqual([]);
  });

  it('Should return 404 if the team does not exist', async () => {
    const nonExistentTeamId = '507f191e810c19729de860ea'; // ID de MongoDB válido pero inexistente

    const response = await request(app)
      .get(`/api/players/${nonExistentTeamId}/players`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Equipo no encontrado');
  });

  it('Should validate that a valid JWT is provided', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35'
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id
    });

    const response = await request(app)
      .get(`/api/players/${team._id}/players`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No autorizado');
  });
});

describe('GET /:teamId/players/:playerId', () => {
  it('Should return the player if the player belongs to the team', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });

    const response = await request(app)
      .get(`/api/players/${team._id}/players/${player._id}`)
      .set('Authorization', `Bearer ${token}`) // Token válido con permisos correctos

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Jugador 1');
    expect(response.body).toHaveProperty('team', team._id.toString());
  });

  it('Should return 404 if the player does not belong to the team', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo 1',
      nameCoach: 'Coach 1',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const team2 = await Team.create({
      nameTeam: 'Equipo 2',
      nameCoach: 'Coach 2',
      branchTeam: 'Varonil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador fuera de equipo',
      lastName: 'Apellido fuera',
      number: 5,
      curp: 'GORA021008HDFNMNA5',
      position: 'Alero',
      team: team2._id,
    });

    const response = await request(app)
    .get(`/api/players/${team._id}/players/${player._id}`)
      .set('Authorization', `Bearer ${token}`); // Token válido para team1, no para team2

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Accion no permitida');
  });

  it('Should return 404 if the player does not exist', async () => {
    const nonExistentPlayerId = '507f191e810c19729de860ea';
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo 1',
      nameCoach: 'Coach 1',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const response = await request(app)
    .get(`/api/players/${team._id}/players/${nonExistentPlayerId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Jugador no encontrado');
  });

  it('Should return 500 if there is a server error', async () => {
    jest.spyOn(Player, 'findById').mockImplementationOnce(() => {
      throw new Error('Database failure');
    });

    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo prueba',
      nameCoach: 'Coach',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador server',
      lastName: 'Error',
      number: 11,
      curp: 'GORA021008HDFNMNAE',
      position: 'Base',
      team: team._id,
    });

    const response = await request(app)
    .get(`/api/players/${team._id}/players/${player._id}`)
    .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Error en el servidor');
  });
});

describe('PUT /:teamId/players/:playerId', () => {
  it('Should update the player successfully', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });
    const newPlayerData = {
      name: 'Nuevo Nombre',
      lastName: 'Nuevo Apellido',
      number: 15,
      curp: 'GORA021008HDFNMNB1',
      position: 'Alero',
    };

    const response = await request(app)
      .put(`/api/players/${team._id}/players/${player._id}`)
      .send(newPlayerData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Jugador actualizado');

    const updatedPlayer = await Player.findById(player._id);
    expect(updatedPlayer).toMatchObject(newPlayerData);
  });

  it('Should return 400 if the CURP is already in use by another player', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });
    const anotherPlayer = await Player.create({
      name: 'Otro Jugador',
      lastName: 'Apellido',
      number: 20,
      curp: 'GORA021008HDFNMNB2', // CURP que se reutilizará
      position: 'Pivot',
      team: team._id,
    });

    const response = await request(app)
    .put(`/api/players/${team._id}/players/${player._id}`)
    .send({name: 'Jugador 2',
      lastName: 'Apellido de prueba 2',
      number: 11,
      curp: anotherPlayer.curp, 
      position: 'Base',}) // CURP ya en uso
      .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'El CURP ya está en uso por otro jugador');
  });

  it('Should return 404 if the player does not belong to the team', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });
  
    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });
  
    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });
  
    const otherTeam = await Team.create({
      nameTeam: 'Otro Equipo',
      nameCoach: 'Otro Coach',
      branchTeam: 'Varonil',
      tournament: tournament._id,
    });
  
    const response = await request(app)
      .put(`/api/players/${otherTeam._id}/players/${player._id}`) 
      .send({ 
        name: 'Jugador 1',
        lastName: 'Apellido de prueba',
        number: 10,
        curp: 'GORA021008HDFNMNA1',
        position: 'Base',
      })
      .set('Authorization', `Bearer ${token}`); 
  
    expect(response.status).toBe(404); 
    expect(response.body).toHaveProperty('error', 'Accion no permitida');
  });
  

  it('Should return 500 if there is a server error', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });
    jest.spyOn(Player.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
    .put(`/api/players/${team._id}/players/${player._id}`)
    .send({  name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obtener el jugador');
  });
});

describe('DELETE /api/players/:teamId/players/:playerId', () => {

  it('Should delete the player successfully', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
      players: [],
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });

    team.players.push(player._id as Types.ObjectId);
    await team.save();

    const response = await request(app)
      .delete(`/api/players/${team._id}/players/${player._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Jugador eliminado');

    const deletedPlayer = await Player.findById(player._id);
    expect(deletedPlayer).toBeNull();

    const updatedTeam = await Team.findById(team._id);
    expect(updatedTeam?.players).not.toContain(player._id);
  });

  it('Should return 500 if there is a server error', async () => {
    jest.spyOn(Player.prototype, 'deleteOne').mockImplementationOnce(() => {
      throw new Error('Mocked server error');
    });

    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });

    const response = await request(app)
      .delete(`/api/players/${team._id}/players/${player._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obtener el jugador');

    jest.restoreAllMocks();
  });

  it('Should return 401 if the user is not authenticated', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35',
    });

    const team = await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: 'Coach de prueba',
      branchTeam: 'Femenil',
      tournament: tournament._id,
    });

    const player = await Player.create({
      name: 'Jugador 1',
      lastName: 'Apellido de prueba',
      number: 10,
      curp: 'GORA021008HDFNMNA1',
      position: 'Base',
      team: team._id,
    });
    const response = await request(app)
      .delete(`/api/players/${team._id}/players/${player._id}`)
      .send(`Authorization: Bearer ${tokenNoValido}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No autorizado');
  });
});


