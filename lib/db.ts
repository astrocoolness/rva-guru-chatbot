import { sql } from '@vercel/postgres';

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      system_prompt TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function getProjects() {
  const { rows } = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
  return rows;
}

export async function createProject(name: string, description?: string, systemPrompt?: string) {
  const { rows } = await sql`
    INSERT INTO projects (name, description, system_prompt)
    VALUES (${name}, ${description || ''}, ${systemPrompt || ''})
    RETURNING *
  `;
  return rows[0];
}

export async function getMessages(projectId: number) {
  const { rows } = await sql`
    SELECT * FROM messages WHERE project_id = ${projectId} ORDER BY created_at ASC
  `;
  return rows;
}

export async function saveMessage(projectId: number, role: string, content: string) {
  await sql`
    INSERT INTO messages (project_id, role, content)
    VALUES (${projectId}, ${role}, ${content})
  `;
}
