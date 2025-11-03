import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://backend:8000';
const VUS = Number(__ENV.VUS || 20);
const DURATION = __ENV.DURATION || '3m';

export const options = {
  scenarios: {
    api_load: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<350', 'p(99)<500'],
  },
};

const createAttempts = new Counter('create_attempts');
const createSuccess = new Counter('create_success');
const createCleanupFail = new Counter('create_cleanup_fail');

const names = ['Ana', 'Juan', 'Maria', 'Luis', 'Carla', 'Pedro', 'Laura', 'Jorge'];
const lastnames = ['Garcia', 'Lopez', 'Martinez', 'Rodriguez', 'Hernandez', 'Gonzalez'];
const searchTerms = ['geo', 'gar', 'maria', 'juan', 'test', 'demo'];
const emailDomains = ['perfload.com', 'testingmail.net', 'mailinator.com'];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildParticipantPayload() {
  const nombre = randomItem(names);
  const apellido = randomItem(lastnames);
  const email = `${nombre}.${apellido}.${uuidv4().slice(0, 8)}@${randomItem(emailDomains)}`.toLowerCase();
  const telefono = `+57${Math.floor(3000000000 + Math.random() * 99999999)}`;

  return JSON.stringify({
    nombre,
    apellido,
    email,
    telefono,
    extra_data: { origen: 'k6', timestamp: Date.now() },
  });
}

export default function () {
  const random = Math.random();

  if (random < 0.55) {
    group('listar participantes', () => {
      const res = http.get(`${BASE_URL}/api/v1/participantes`, { tags: { name: 'listar' } });
      check(res, {
        'lista status 200': (r) => r.status === 200,
        'lista responde < 300ms': (r) => r.timings.duration < 300,
      });
    });
  } else if (random < 0.85) {
    group('buscar participantes', () => {
      const term = randomItem(searchTerms);
      const res = http.get(`${BASE_URL}/api/v1/participantes/search?q=${term}`, {
        tags: { name: 'buscar' },
      });
      check(res, {
        'search status 200': (r) => r.status === 200,
        'search responde < 350ms': (r) => r.timings.duration < 350,
      });
    });
  } else {
    group('crear y limpiar participante', () => {
      createAttempts.add(1);
      const payload = buildParticipantPayload();
      const headers = { 'Content-Type': 'application/json' };

      const res = http.post(`${BASE_URL}/api/v1/participantes`, payload, {
        headers,
        tags: { name: 'crear' },
      });

      const created = res.status === 201 ? res.json() : null;

      check(res, {
        'create status 201 o 400 (duplicado)': (r) => r.status === 201 || r.status === 400,
      });

      if (created && created.id) {
        createSuccess.add(1);
        const delRes = http.del(`${BASE_URL}/api/v1/participantes/${created.id}`, null, {
          tags: { name: 'eliminar' },
        });
        check(delRes, {
          'delete status 204': (r) => r.status === 204,
        }) || createCleanupFail.add(1);
      }
    });
  }

  sleep(1);
}
