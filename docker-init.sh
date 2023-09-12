docker run --name mongodb -d -p 27017:27017 mongo mongod --replSet rs0
docker exec -it mongodb mongosh 
rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})
yarn prisma db push