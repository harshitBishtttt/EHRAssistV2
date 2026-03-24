package com.ehrassist.repository.master;

import com.ehrassist.entity.master.MedicationCodeMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicationCodeMasterRepository extends JpaRepository<MedicationCodeMasterEntity, Integer> {
    Optional<MedicationCodeMasterEntity> findByCodeValue(String codeValue);
}
