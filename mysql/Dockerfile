FROM mysql:8.0
ENV MYSQL_ROOT_PASSWORD=cronos2024
EXPOSE 3306
COPY docker/mysql/init.sql /docker-entrypoint-initdb.d/
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
