package com.example.portalegresso.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	ApplicationContext context;

	@Test
	void contextLoads() {
		assertFalse(context.containsBean("demoDataInitializer"));
	}

}
