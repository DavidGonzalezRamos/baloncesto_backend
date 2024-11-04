import request from "supertest";
import app from "../../server";
import { connectDB, disconnectDB } from "../../config/db";
import Tournament from "../../models/Tournament";


const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjdjYzNiZDIxYjVjNmQxNDE2ZWMzNSIsImlhdCI6MTczMDY2MTQ2MiwiZXhwIjoxNzQ2MjEzNDYyfQ.eIIEyryXkKXJXMMjvr3kfVcELkkC0wu9xHSO4eu-rEw"
const tokenNoValido = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjdmYjkwMTA5OTU0N2ZkNWJhZDE2ZCIsImlhdCI6MTczMDY4Nzg1NSwiZXhwIjoxNzQ2MjM5ODU1fQ.fqgqp3w3jCZZjv6WaDGkD5nbWhlfRU3viTmvQ9ABIgA"

beforeAll(async () => {
  await connectDB();
  await Tournament.deleteMany({});
});

beforeEach(async () => {
  await Tournament.deleteMany({});
});

afterAll(async () => {
  await Tournament.deleteMany({});
  await disconnectDB();
});

describe('POST /api/tournaments', () => {
  it('Should create a new tournament', async () => {
    const response = await request(app)
      .post('/api/tournaments')
      .set("Authorization", `Bearer ${token}`)
      .send({
        "dateStart": "2025-10-05",
        "dateEnd": "2025-11-13",
        "tournamentName": "Torneo de testing"
      });

    expect(response.status).toBe(201);
    expect(response.text).toBe('Torneo creado correctamente');
  });

  it('Should return an error if tournament creation fails', async () => {
    const response = await request(app)
      .post('/api/tournaments')
      .set("Authorization", `Bearer ${token}`)
      .send({
        "dateStart": "invalid-date",
        "dateEnd": "2025-11-13",
        "tournamentName": "Torneo de testing"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0]).toHaveProperty('msg', 'Invalid value');
  });
});

describe('GET /api/tournaments', () => {
  it('Should get all tournaments', async () => {
    // Crear torneos de prueba
    await Tournament.create([
      { dateStart: '2025-10-05', dateEnd: '2025-11-13', tournamentName: 'Torneo 1' },
      { dateStart: '2025-12-01', dateEnd: '2025-12-15', tournamentName: 'Torneo 2' }
    ]);

    const response = await request(app)
      .get('/api/tournaments')
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    // Ordenar los torneos por tournamentName antes de verificar
    const sortedTournaments = response.body.sort((a: any, b: any) => a.tournamentName.localeCompare(b.tournamentName));

    expect(sortedTournaments[0]).toHaveProperty('tournamentName', 'Torneo 1');
    expect(sortedTournaments[1]).toHaveProperty('tournamentName', 'Torneo 2');
  });

  it('Should return an error if there is a problem retrieving tournaments', async () => {
    // Simular un error en la base de datos
    jest.spyOn(Tournament, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/api/tournaments')
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obtener los torneos');
  });

  it('Should return an empty array if no tournaments are found', async () => {
    const response = await request(app)
      .get('/api/tournaments')
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('Should not get tournaments without authorization', async () => {
    const response = await request(app)
      .get('/api/tournaments');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No autorizado');
  });

  it('Should not get tournaments with an invalid token', async () => {
    const invalidToken = '848153';

    const response = await request(app)
      .get('/api/tournaments')
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Token inválido');
  });
});

describe('GET /api/tournaments/:id', () => {
  it('Should get a tournament by ID', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba'
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tournamentName', 'Torneo de prueba');
  });

  it('Should return an error if the tournament is not found', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011'; // ID que no existe en la base de datos

    const response = await request(app)
      .get(`/api/tournaments/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Torneo no encontrado');
  });

  it('Should return an error if there is a problem retrieving the tournament', async () => {
    // Simular un error en la base de datos
    jest.spyOn(Tournament, 'findById').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get(`/api/tournaments/507f1f77bcf86cd799439011`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al obtener el torneo');
  });

  it('Should not get a tournament with an invalid ID format', async () => {
    const invalidId = '12345'; // ID con formato inválido

    const response = await request(app)
      .get(`/api/tournaments/${invalidId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0]).toHaveProperty('msg', 'El id no es valido');
  });

  it('Should not get a tournament without authorization', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba'
    });

    const response = await request(app)
      .get(`/api/tournaments/${tournament._id}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No autorizado');
  });
});

describe('PUT /api/tournaments/:id', () => {
  it('Should update a tournament', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const response = await request(app)
      .put(`/api/tournaments/${tournament._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        dateStart: '2025-11-01',
        dateEnd: '2025-11-13',
        tournamentName: 'Torneo actualizado'
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Torneo actualizado correctamente');

    const updatedTournament = await Tournament.findById(tournament._id);
    expect(updatedTournament).toHaveProperty('dateStart');
    expect(new Date(updatedTournament.dateStart).toISOString().split('T')[0]).toBe('2025-11-01');
    expect(updatedTournament).toHaveProperty('tournamentName', 'Torneo actualizado');
  });

  it('Should return an error if the tournament is not found', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011'; // ID que no existe en la base de datos

    const response = await request(app)
      .put(`/api/tournaments/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        dateStart: '2025-11-01',
        dateEnd: '2025-11-13',
        tournamentName: 'Torneo actualizado'
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Torneo no encontrado');
  });

  it('Should return an error if the user is not authorized', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba2',
      role: '6727cc3bd21b5c6d1416ec35' // ID de otro usuario
    });

    const response = await request(app)
      .put(`/api/tournaments/${tournament._id}`)
      .set("Authorization", `Bearer ${tokenNoValido}`)
      .send({
        dateStart: '2025-11-01',
        tournamentName: 'Torneo actualizado'
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'No tienes permisos para realizar esta acción');
  });

  it('Should return an error if there is a problem updating the tournament', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Simular un error en la base de datos
    jest.spyOn(Tournament.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .put(`/api/tournaments/${tournament._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        dateStart: '2025-11-01',
        dateEnd: '2025-11-13',
        tournamentName: 'Torneo actualizado'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al actualizar el torneo');
  });
});

describe('DELETE /api/tournaments/:id', () => {
  it('Should delete a tournament', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    const response = await request(app)
      .delete(`/api/tournaments/${tournament._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Torneo eliminado correctamente');

    const deletedTournament = await Tournament.findById(tournament._id);
    expect(deletedTournament).toBeNull();
  });

  it('Should return an error if the tournament is not found', async () => {
    const nonExistentId = '507f1f77bcf86cd799439011'; // ID que no existe en la base de datos

    const response = await request(app)
      .delete(`/api/tournaments/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Torneo no encontrado');
  });

  it('Should return an error if the user is not authorized', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
        dateStart: '2025-10-05',
        dateEnd: '2025-11-13',
        tournamentName: 'Torneo de prueba',
        role: '6727cc3bd21b5c6d1416ec35' // ID de un usuario administrador
    });

    const response = await request(app)
        .delete(`/api/tournaments/${tournament._id}`)
        .set("Authorization", `Bearer ${tokenNoValido}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'No autorizado');
});


  it('Should return an error if there is a problem deleting the tournament', async () => {
    // Crear un torneo de prueba
    const tournament = await Tournament.create({
      dateStart: '2025-10-05',
      dateEnd: '2025-11-13',
      tournamentName: 'Torneo de prueba',
      role: '6727cc3bd21b5c6d1416ec35' // ID del usuario administrador
    });

    // Simular un error en la base de datos
    jest.spyOn(Tournament.prototype, 'deleteOne').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .delete(`/api/tournaments/${tournament._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Error al eliminar el torneo');
  });
});