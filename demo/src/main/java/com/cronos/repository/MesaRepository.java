package com.cronos.repository;
 
import com.cronos.entity.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.List;
 
@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {
 
    List<Mesa> findByEstado(Mesa.EstadoMesa estado);
 
    List<Mesa> findByTipo(Mesa.TipoMesa tipo);
 
    List<Mesa> findByActivaTrue();
 
    boolean existsByNumero(Integer numero);
}