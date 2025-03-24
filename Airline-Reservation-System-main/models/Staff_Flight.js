/* eslint-disable camelcase */
const pool = require('../config/db');

class Flight {
    static async getAllArrivedFlights() {
        const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination,actual_arrival
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Landed'
                        ORDER BY get_timestamp(arrival_date,arrival_time_utc) DESC;`;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getAllOngoingFlights() {
        const query = `SELECT schedule_id,aircraft_id,departure_date,arrival_date,departure_time_utc,arrival_time_utc,duration,origin,destination,flight_state
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE (flight_state =$1 OR flight_state=$2) OR (flight_state=$3 AND departure_date<=NOW()::DATE)
                        ORDER BY get_timestamp(arrival_date,arrival_time_utc) ASC;`;
        const result = await pool.query(query, ['Departed-On-Time', 'Delayed-Departure', 'Scheduled']);
        return result.rows;
    }

    static async getAllUpcomingFlights() {
        const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled'  AND departure_date>NOW()::DATE
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
        const result = await pool.query(query);
        return result.rows;
    }

    static async incomingPendingFlightDetails(staff_member_airport) {
        const query = `SELECT schedule_id,aircraft_id,departure_time_utc,arrival_time_utc,duration,origin,destination,flight_state,actual_departed
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE (flight_state=$1 OR flight_state=$2) AND destination=$3
                        ORDER BY get_timestamp(arrival_date,arrival_time_utc) ASC`;
        const result = await pool.query(query, ['Departed-On-Time', 'Delayed-Departure', staff_member_airport]);
        return result.rows;
    }

    static async getToBeDepartedFlights(staff_member_airport) {
        const query = `SELECT schedule_id,aircraft_id,departure_time_utc,arrival_time_utc,duration,origin,destination,departure_date
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND departure_date<=NOW()::DATE AND origin=$1
                        AND (SELECT aircraft_state FROM aircraft_instance WHERE aircraft_id=flight_schedule.aircraft_id)='On-Ground'
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC;`;

        const result = await pool.query(query, [staff_member_airport]);
        return result.rows;
    }

    static async getArrivedFlights(staff_member_airport){
        const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination,actual_arrival
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Landed' AND destination=$1
                        ORDER BY get_timestamp(arrival_date,arrival_time_utc) DESC;`
        const result = await pool.query(query, [staff_member_airport]);
        return result.rows;
    }



    static async getUpcomingIncomingFlights(staff_member_airport) {
        const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND (destination=$1) AND departure_date>NOW()::DATE
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
        const result = await pool.query(query, [staff_member_airport]);

        return result.rows;
    }

    static async getUpcomingIncomingFlightsFiltered(staff_member_airport,filtered_airports,type) {
        
        if(type=='object'){
            const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND (destination=$1) AND departure_date>NOW()::DATE AND origin=ANY($2)
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
            const result = await pool.query(query, [staff_member_airport,filtered_airports]);
            return result.rows;
        }
        else if(type=='string'){
            const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND (destination=$1) AND departure_date>NOW()::DATE AND origin=$2
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
            const result = await pool.query(query, [staff_member_airport,filtered_airports]);
            return result.rows;
        }
    }

    static async getUpcomingOutgoingFlights(staff_member_airport) {
        const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND (origin=$1) AND departure_date>NOW()::DATE
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
        const result = await pool.query(query, [staff_member_airport]);

        return result.rows;
    }

    static async getUpcomingOutgoingFlightsFiltered(staff_member_airport,filtered_airports,type) {
        
        if(type=='object'){
            const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND (origin=$1) AND departure_date>NOW()::DATE AND destination=ANY($2)
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
            const result = await pool.query(query, [staff_member_airport,filtered_airports]);
            return result.rows;
        }
        else if(type=='string'){
            const query = `SELECT schedule_id,aircraft_id,departure_date,departure_time_utc,arrival_date,arrival_time_utc,duration,origin,destination
                        FROM flight_schedule LEFT OUTER JOIN route USING(route_id)
                        WHERE flight_state='Scheduled' AND (origin=$1) AND departure_date>NOW()::DATE AND destination=$2
                        ORDER BY get_timestamp(departure_date,departure_time_utc) ASC`;
            const result = await pool.query(query, [staff_member_airport,filtered_airports]);
            return result.rows;
        }
    }

    static async markArrival(schedule_id) {
        const query = 'CALL handleflightarrival($1)';
        await pool.query(query, [schedule_id]);
    }

    static async markDeparture(schedule_id) {
        const query = 'CALL handleflightdeparture($1)';
        await pool.query(query, [schedule_id]);
    }

    static async getUpcomingFlightGeneralInfo(aircraft_id) {
        const query = `SELECT model_name,variant,economy_seat_capacity,business_seat_capacity,platinum_seat_capacity
                        FROM aircraft_model
                        WHERE model_id=(SELECT model_id FROM aircraft_instance WHERE aircraft_id=$1)`;
        const result = await pool.query(query, [aircraft_id]);
        return result.rows[0];
    }


    static async getPassengerDetails(schedule_id){
        const query = `SELECT * FROM details_except_booked_person 
                        LEFT OUTER JOIN booked_user_details 
                        USING(customer_id)
                        WHERE schedule_id=$1;`
        const result = await pool.query(query, [schedule_id]);
        //console.log(result.rows);
        return result.rows;      
    }
    static async getAllRoutes(){
        const query=`SELECT * FROm Route`
        const result= await pool.query(query);
        return result.rows;

    }
}

module.exports = Flight;
