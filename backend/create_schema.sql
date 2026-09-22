CREATE TABLE IF NOT EXISTS games (
	id SERIAL NOT NULL, 
	code VARCHAR, 
	name VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	description TEXT, 
	icon_name VARCHAR, 
	PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS ix_games_id ON games (id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_games_code ON games (code);
CREATE TABLE IF NOT EXISTS sync_queue (
	id SERIAL NOT NULL, 
	client_tx_id VARCHAR, 
	entity_type VARCHAR NOT NULL, 
	payload JSON NOT NULL, 
	status VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	synced_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_sync_queue_client_tx_id ON sync_queue (client_tx_id);
CREATE INDEX IF NOT EXISTS ix_sync_queue_id ON sync_queue (id);
CREATE TABLE IF NOT EXISTS users (
	id SERIAL NOT NULL, 
	email VARCHAR NOT NULL, 
	hashed_password VARCHAR NOT NULL, 
	role VARCHAR NOT NULL, 
	full_name VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE TABLE IF NOT EXISTS audit_logs (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	user_role VARCHAR NOT NULL, 
	action VARCHAR NOT NULL, 
	details TEXT, 
	timestamp TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_id ON audit_logs (id);
CREATE TABLE IF NOT EXISTS guardians (
	id SERIAL NOT NULL, 
	user_id INTEGER, 
	phone_number VARCHAR, 
	relationship_to_patient VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS ix_guardians_id ON guardians (id);
CREATE TABLE IF NOT EXISTS patient_profiles (
	id SERIAL NOT NULL, 
	user_id INTEGER, 
	guardian_id INTEGER, 
	age INTEGER, 
	gender VARCHAR, 
	preferred_language VARCHAR, 
	voice_preference VARCHAR, 
	communication_preference VARCHAR, 
	hobbies TEXT, 
	caregiver_clinical_notes TEXT, 
	emergency_contact VARCHAR, 
	onboarding_completed BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(guardian_id) REFERENCES guardians (id)
);

CREATE INDEX IF NOT EXISTS ix_patient_profiles_id ON patient_profiles (id);
CREATE TABLE IF NOT EXISTS activities (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	activity_type VARCHAR NOT NULL, 
	details VARCHAR, 
	timestamp TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_activities_id ON activities (id);
CREATE TABLE IF NOT EXISTS alerts (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	alert_type VARCHAR NOT NULL, 
	message TEXT NOT NULL, 
	severity VARCHAR, 
	is_resolved BOOLEAN, 
	occurrence_key VARCHAR, 
	event_time TIMESTAMP WITHOUT TIME ZONE, 
	synced_time TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_alerts_occurrence_key ON alerts (occurrence_key);
CREATE INDEX IF NOT EXISTS ix_alerts_id ON alerts (id);
CREATE TABLE IF NOT EXISTS cognitive_profiles (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	current_difficulty INTEGER, 
	memory_score FLOAT, 
	attention_score FLOAT, 
	recall_score FLOAT, 
	pattern_score FLOAT, 
	object_recognition_score FLOAT, 
	routine_recall_score FLOAT, 
	avg_response_time_ms FLOAT, 
	recent_trend VARCHAR, 
	last_updated TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (patient_id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_cognitive_profiles_id ON cognitive_profiles (id);
CREATE TABLE IF NOT EXISTS game_sessions (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	game_code VARCHAR NOT NULL, 
	difficulty_level INTEGER, 
	accuracy_percentage FLOAT NOT NULL, 
	avg_response_time_ms FLOAT NOT NULL, 
	mistakes_count INTEGER, 
	attempts_count INTEGER, 
	completed BOOLEAN, 
	played_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_game_sessions_id ON game_sessions (id);
CREATE TABLE IF NOT EXISTS language_preferences (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	language_code VARCHAR, 
	font_size_scale FLOAT, 
	PRIMARY KEY (id), 
	UNIQUE (patient_id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_language_preferences_id ON language_preferences (id);
CREATE TABLE IF NOT EXISTS patient_locations (
	id SERIAL NOT NULL, 
	patient_id INTEGER NOT NULL, 
	latitude FLOAT NOT NULL, 
	longitude FLOAT NOT NULL, 
	accuracy FLOAT, 
	is_sharing_enabled BOOLEAN, 
	is_online BOOLEAN, 
	timestamp TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_patient_locations_id ON patient_locations (id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_patient_locations_patient_id ON patient_locations (patient_id);
CREATE TABLE IF NOT EXISTS people (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	name VARCHAR NOT NULL, 
	relationship VARCHAR NOT NULL, 
	photo_url VARCHAR, 
	notes TEXT, 
	frequently_seen BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_people_id ON people (id);
CREATE TABLE IF NOT EXISTS places (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	name VARCHAR NOT NULL, 
	category VARCHAR, 
	address VARCHAR NOT NULL, 
	latitude FLOAT NOT NULL, 
	longitude FLOAT NOT NULL, 
	notes TEXT, 
	photo_url VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_places_id ON places (id);
CREATE TABLE IF NOT EXISTS reminders (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	title VARCHAR NOT NULL, 
	category VARCHAR, 
	scheduled_time VARCHAR NOT NULL, 
	is_recurring BOOLEAN, 
	status VARCHAR, 
	completed_at TIMESTAMP WITHOUT TIME ZONE, 
	skipped_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_reminders_id ON reminders (id);
CREATE TABLE IF NOT EXISTS routines (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	time_of_day VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	icon_symbol VARCHAR, 
	status VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_routines_id ON routines (id);
CREATE TABLE IF NOT EXISTS voice_interactions (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	transcript TEXT NOT NULL, 
	intent VARCHAR, 
	assistant_response TEXT NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_voice_interactions_id ON voice_interactions (id);
CREATE TABLE IF NOT EXISTS voice_profiles (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	passphrase VARCHAR, 
	sample_phrase VARCHAR, 
	is_enrolled BOOLEAN, 
	enrolled_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (patient_id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id)
);

CREATE INDEX IF NOT EXISTS ix_voice_profiles_id ON voice_profiles (id);
CREATE TABLE IF NOT EXISTS face_recognition_profiles (
	id SERIAL NOT NULL, 
	person_id INTEGER, 
	embedding_data JSON, 
	sample_embeddings JSON, 
	confidence_threshold FLOAT, 
	sample_images_count INTEGER, 
	enrolled_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (person_id), 
	FOREIGN KEY(person_id) REFERENCES people (id)
);

CREATE INDEX IF NOT EXISTS ix_face_recognition_profiles_id ON face_recognition_profiles (id);
CREATE TABLE IF NOT EXISTS game_results (
	id SERIAL NOT NULL, 
	session_id INTEGER, 
	question_index INTEGER NOT NULL, 
	is_correct BOOLEAN NOT NULL, 
	time_taken_ms FLOAT NOT NULL, 
	user_answer VARCHAR, 
	correct_answer VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES game_sessions (id)
);

CREATE INDEX IF NOT EXISTS ix_game_results_id ON game_results (id);
CREATE TABLE IF NOT EXISTS memories (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	title VARCHAR NOT NULL, 
	description TEXT NOT NULL, 
	place VARCHAR, 
	people_involved VARCHAR, 
	memory_date VARCHAR, 
	photo_url VARCHAR, 
	voice_note_url VARCHAR, 
	tags VARCHAR, 
	category VARCHAR, 
	associated_person_id INTEGER, 
	associated_place_id INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id), 
	FOREIGN KEY(associated_person_id) REFERENCES people (id), 
	FOREIGN KEY(associated_place_id) REFERENCES places (id)
);

CREATE INDEX IF NOT EXISTS ix_memories_id ON memories (id);
CREATE TABLE IF NOT EXISTS memory_activity_results (
	id SERIAL NOT NULL, 
	patient_id INTEGER, 
	memory_id INTEGER, 
	target_person_id INTEGER, 
	is_correct BOOLEAN NOT NULL, 
	time_taken_ms FLOAT NOT NULL, 
	attempts_count INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(patient_id) REFERENCES patient_profiles (id), 
	FOREIGN KEY(memory_id) REFERENCES memories (id), 
	FOREIGN KEY(target_person_id) REFERENCES people (id)
);

CREATE INDEX IF NOT EXISTS ix_memory_activity_results_id ON memory_activity_results (id);
