package com.ehrassist.repository.master;

import com.ehrassist.entity.master.ObservationCodeMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ObservationCodeMasterRepository extends JpaRepository<ObservationCodeMasterEntity, Integer> {
    Optional<ObservationCodeMasterEntity> findByCodeSystemAndCodeValue(String codeSystem, String codeValue);
    Optional<ObservationCodeMasterEntity> findByItemId(Integer itemId);
}
