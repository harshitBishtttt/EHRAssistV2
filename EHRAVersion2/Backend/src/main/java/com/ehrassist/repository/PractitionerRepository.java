package com.ehrassist.repository;

import com.ehrassist.entity.PractitionerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PractitionerRepository extends JpaRepository<PractitionerEntity, UUID>, JpaSpecificationExecutor<PractitionerEntity> {
}
