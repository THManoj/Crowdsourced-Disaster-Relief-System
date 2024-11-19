USE disastermanagementsystem;

-- Function to get total donations for a disaster
CREATE FUNCTION IF NOT EXISTS GetTotalDonationsForDisaster(disaster_id_param INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT COALESCE(SUM(amount), 0.00)
    INTO total
    FROM donations
    WHERE disaster_id = disaster_id_param;
    RETURN total;
END;

-- Function to check relief camp capacity
CREATE FUNCTION IF NOT EXISTS CheckCampCapacity(camp_id_param INT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE current_count INT;
    DECLARE max_capacity INT;
    
    SELECT COUNT(*) INTO current_count
    FROM volunteers 
    WHERE camp_id = camp_id_param;
    
    SELECT capacity INTO max_capacity
    FROM reliefcamps 
    WHERE camp_id = camp_id_param;
    
    RETURN current_count < max_capacity;
END;

-- Trigger for creating SOS alerts for high severity disasters
CREATE TRIGGER IF NOT EXISTS after_disaster_insert 
AFTER INSERT ON disasters
FOR EACH ROW 
BEGIN
    IF NEW.severity_level = 3 THEN
        INSERT INTO sosalerts (user_id, disaster_id, message, status)
        VALUES (
            NEW.reported_by,
            NEW.disaster_id,
            CONCAT('High severity ', NEW.disaster_type, ' reported in ', NEW.location, '. Immediate assistance required.'),
            'Pending'
        );
    END IF;
END;

-- Trigger for handling SOS alerts when severity is updated
CREATE TRIGGER IF NOT EXISTS after_disaster_update 
AFTER UPDATE ON disasters
FOR EACH ROW 
BEGIN
    IF NEW.severity_level = 3 AND OLD.severity_level != 3 THEN
        INSERT INTO sosalerts (user_id, disaster_id, message, status)
        VALUES (
            NEW.reported_by,
            NEW.disaster_id,
            CONCAT('High severity ', NEW.disaster_type, ' reported in ', NEW.location, '. Immediate assistance required.'),
            'Pending'
        );
    ELSEIF NEW.severity_level != 3 AND OLD.severity_level = 3 THEN
        DELETE FROM sosalerts WHERE disaster_id = NEW.disaster_id;
    END IF;
END;

-- Trigger for cascade deletion
CREATE TRIGGER IF NOT EXISTS before_disaster_delete
BEFORE DELETE ON disasters
FOR EACH ROW
BEGIN
    DELETE FROM sosalerts WHERE disaster_id = OLD.disaster_id;
    DELETE FROM reliefcamps WHERE disaster_id = OLD.disaster_id;
    DELETE FROM donations WHERE disaster_id = OLD.disaster_id;
END;

-- Procedure to get high severity disasters with pending alerts
CREATE PROCEDURE IF NOT EXISTS GetHighSeverityDisasters()
BEGIN
    SELECT 
        d.disaster_id,
        d.disaster_type,
        d.location,
        d.severity_level,
        d.description,
        sa.status as sos_status,
        sa.sent_at as sos_created_at
    FROM disasters d
    LEFT JOIN sosalerts sa ON d.disaster_id = sa.disaster_id
    WHERE d.severity_level = 3
    ORDER BY d.reported_at DESC;
END;

-- Procedure to assign volunteer to camp with capacity check
CREATE PROCEDURE IF NOT EXISTS AssignVolunteerToCamp(
    IN p_user_id INT,
    IN p_camp_id INT,
    IN p_task_description TEXT
)
BEGIN
    DECLARE camp_full BOOLEAN;
    SELECT NOT CheckCampCapacity(p_camp_id) INTO camp_full;
    
    IF camp_full THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Camp is at full capacity';
    ELSE
        INSERT INTO volunteers (user_id, camp_id, task_description)
        VALUES (p_user_id, p_camp_id, p_task_description);
    END IF;
END;