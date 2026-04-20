package com.cronos.repository;

import com.cronos.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByFecha(LocalDate fecha);

    List<Reserva> findByMesaIdAndFecha(Long mesaId, LocalDate fecha);

    List<Reserva> findByEstado(Reserva.EstadoReserva estado);

    List<Reserva> findByFechaBetween(LocalDate inicio, LocalDate fin);

    boolean existsByMesaIdAndFechaAndTurnoAndEstadoNot(
            Long mesaId,
            LocalDate fecha,
            Reserva.Turno turno,
            Reserva.EstadoReserva estado
    );
}