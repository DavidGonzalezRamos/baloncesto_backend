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