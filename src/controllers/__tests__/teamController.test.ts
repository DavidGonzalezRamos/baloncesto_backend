import request from "supertest";
import app from "../../server";
import { connectDB, disconnectDB } from "../../config/db";
import Team from "../../models/Team";
import Tournament from "../../models/Tournament";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjdjYzNiZDIxYjVjNmQxNDE2ZWMzNSIsImlhdCI6MTczMDY2MTQ2MiwiZXhwIjoxNzQ2MjEzNDYyfQ.eIIEyryXkKXJXMMjvr3kfVcELkkC0wu9xHSO4eu-rEw";
const tokenNoValido = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjdmYjkwMTA5OTU0N2ZkNWJhZDE2ZCIsImlhdCI6MTczMDY4Nzg1NSwiZXhwIjoxNzQ2MjM5ODU1fQ.fqgqp3w3jCZZjv6WaDGkD5nbWhlfRU3viTmvQ9ABIgA"

beforeAll(async () => {
  await connectDB();
  await Team.deleteMany({});
  await Tournament.deleteMany({});
});

beforeEach(async () => {
  await Team.deleteMany({});
  await Tournament.deleteMany({});
});

afterAll(async () => {
  await Team.deleteMany({});
  await Tournament.deleteMany({});
  await disconnectDB();
});

describe('POST /api/teams', () => {
  it('Should create a new team', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const response = await request(app)
      .post(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nameTeam: 'Equipo de prueba',
        nameCoach: "Yo2",
        branchTeam: "Femenil"
      });

      expect(response.status).toBe(201);
      expect(response.text).toBe('Equipo creado');

    const createdTeam = await Team.findOne({ nameTeam: 'Equipo de prueba' });
    expect(createdTeam).not.toBeNull();
    expect(createdTeam).toHaveProperty('nameTeam', 'Equipo de prueba');
  });

  it('Should return an error if the team already exists in the tournament', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Crear un equipo de prueba
    await Team.create({
      nameTeam: 'Equipo de prueba',
      nameCoach: "Yo2",
      branchTeam: "Femenil",
      tournament: tournament._id 
    });

    const response = await request(app)
      .post(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nameTeam: 'Equipo de prueba',
        nameCoach: "Yo2",
        branchTeam: "Femenil",
        tournament: tournament._id
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'El equipo ya existe en este torneo');
  });

  it('Should return an error if there is a problem creating the team', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Simular un error en la base de datos
    jest.spyOn(Team.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .post(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nameTeam: 'Equipo de prueba',
        nameCoach: "Yo2",
        branchTeam: "Femenil"
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al crear el equipo');
  });

  it('Should return an error if the user is not authorized', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const response = await request(app)
      .post(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${tokenNoValido}`)
      .send({
        nameTeam: 'Equipo de prueba',
        tournament: tournament._id
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'No tienes permisos para realizar esta acción');
  });
});

describe('GET /api/tournaments/:tournamentId/teams', () => {
  it('Should get all teams in a tournament', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    await Team.create([
      { nameTeam: 'Equipo 1', nameCoach: "Yo", branchTeam: "Femenil", tournament: tournament._id },
      { nameTeam: 'Equipo 2', nameCoach: "Yo2", branchTeam: "Varonil", tournament: tournament._id }
    ]);

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    const sortedTeams = response.body.sort((a: any, b: any) => a.nameTeam.localeCompare(b.nameTeam));
    expect(sortedTeams[0]).toHaveProperty('nameTeam', 'Equipo 1');
    expect(sortedTeams[1]).toHaveProperty('nameTeam', 'Equipo 2');
  });

  it('Should return an error if there is a problem retrieving teams', async () => {
    jest.spyOn(Team, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35'
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obterner los equipos');
  });

  it('Should return 404 if the tournament does not exist', async () => {
    const invalidTournamentId = '60f7b5b5b5b5b5b5b5b5b5b5';

    const response = await request(app)
      .get(`/api/tournaments/${invalidTournamentId}/teams`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Torneo no encontrado');
  });

  it('Should return an error if the authorization token is missing', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35'
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No autorizado');
  });

  it('Should return an empty array if no teams are found in the tournament', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba sin equipos',
      role: '6727cc3bd21b5c6d1416ec35'
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});


describe('GET /api/tournaments/:tournamentId/teams/:teamId', () => {
  it('Should get a team by ID', async () => {
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
      nameCoach: "Yo2",
      branchTeam: "Femenil",
      tournament: tournament._id 
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nameTeam', 'Equipo de prueba');
    expect(response.body).toHaveProperty('tournament', tournament._id.toString());
  });

  it('Should return an error if the team is not found', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const nonExistentTeamId = '507f1f77bcf86cd799439011'; // ID que no existe en la base de datos

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams/${nonExistentTeamId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Equipo no encontrado');
  });

  it('Should return an error if there is a problem retrieving the team', async () => {
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
      nameCoach: "Yo2",
      branchTeam: "Femenil",
      tournament: tournament._id 
    });

    // Simular un error en la base de datos
    jest.spyOn(Team, 'findById').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Error en el servidor');
  });
});

describe('PUT /api/tournaments/:tournamentId/teams/:teamId', () => {
  it('Should update a team', async () => {
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
      .put(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nameTeam: 'Equipo actualizado',
        nameCoach: 'Coach actualizado',
        branchTeam: 'Varonil'
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Equipo actualizado');

    const updatedTeam = await Team.findById(team._id);
    expect(updatedTeam).toHaveProperty('nameTeam', 'Equipo actualizado');
    expect(updatedTeam).toHaveProperty('nameCoach', 'Coach actualizado');
    expect(updatedTeam).toHaveProperty('branchTeam', 'Varonil');
  });

  it('Should return an error if the team is not found', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const nonExistentTeamId = '507f1f77bcf86cd799439011'; // ID que no existe en la base de datos

    const response = await request(app)
      .put(`/api/tournaments/${tournament._id}/teams/${nonExistentTeamId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nameTeam: 'Equipo actualizado',
        nameCoach: 'Coach actualizado',
        branchTeam: 'Varonil'
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Equipo no encontrado');
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
      .put(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${tokenNoValido}`)
      .send({
        nameTeam: 'Equipo actualizado',
        nameCoach: 'Coach actualizado',
        branchTeam: 'Varonil'
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'No tienes permisos para realizar esta acción');
  });

  it('Should return an error if there is a problem updating the team', async () => {
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
    jest.spyOn(Team.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .put(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nameTeam: 'Equipo actualizado',
        nameCoach: 'Coach actualizado',
        branchTeam: 'Varonil'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al actualizar el equipo');
  });
});

describe('DELETE /api/tournaments/:tournamentId/teams/:teamId', () => {
  it('Should delete a team', async () => {
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
      .delete(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Equipo eliminado');

    const deletedTeam = await Team.findById(team._id);
    expect(deletedTeam).toBeNull();
  });

  it('Should return an error if the team is not found', async () => {
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const nonExistentTeamId = '507f1f77bcf86cd799439011'; // ID que no existe en la base de datos

    const response = await request(app)
      .delete(`/api/tournaments/${tournament._id}/teams/${nonExistentTeamId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Equipo no encontrado');
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
      .delete(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${tokenNoValido}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'No tienes permisos para realizar esta acción');
  });

  it('Should return an error if there is a problem deleting the team', async () => {
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
    jest.spyOn(Team.prototype, 'deleteOne').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .delete(`/api/tournaments/${tournament._id}/teams/${team._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obtener el equipo');
  });
});