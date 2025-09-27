CREATE TABLE event
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    start_time  DATETIME     NOT NULL,
    end_time    DATETIME     NOT NULL,
    location    VARCHAR(255),
    PRIMARY KEY (id)
);
